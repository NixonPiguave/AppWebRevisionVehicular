package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.service.backup.jobs.DifferentialBackupJob;
import com.revisionvehicular.backend.service.backup.jobs.FullBackupJob;
import com.revisionvehicular.backend.service.backup.jobs.IncrementalBackupJob;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.TimeZone;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class BackupSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(BackupSchedulerService.class);

    private static final String GROUP = "backup-group";

    private static final String JOB_FULL = "job-full";
    private static final String JOB_DIFFERENTIAL = "job-differential";
    private static final String JOB_INCREMENTAL = "job-incremental";

    private static final String TRIGGER_FULL = "trigger-full";
    private static final String TRIGGER_DIFFERENTIAL = "trigger-differential";
    private static final String TRIGGER_INCREMENTAL = "trigger-incremental";

    private final Scheduler scheduler;
    private final IBackupConfigRepository configRepository;

    private final AtomicBoolean programacionInicialHecha = new AtomicBoolean(false);

    public BackupSchedulerService(Scheduler scheduler,
                                  IBackupConfigRepository configRepository) {
        this.scheduler = scheduler;
        this.configRepository = configRepository;
    }

    /**
     * Ejecuta después de que el contexto (y el Scheduler de Quartz) estén listos.
     * {@code @PostConstruct} corre demasiado pronto; aquí el {@link Scheduler} ya puede programar triggers.
     */
    @EventListener(ContextRefreshedEvent.class)
    public void onContextRefreshed(ContextRefreshedEvent event) {
        if (event.getApplicationContext().getParent() != null) {
            return;
        }
        if (!programacionInicialHecha.compareAndSet(false, true)) {
            return;
        }
        try {
            inicializarDesdeBase();
        } catch (Exception e) {
            log.error("Error al inicializar programación de respaldos automáticos desde BD", e);
        }
    }

    void inicializarDesdeBase() {
        configRepository.findTopByOrderByConfigIdDesc().ifPresent(config -> {
            if (Boolean.TRUE.equals(config.getSchedulerActivo())) {
                log.info("Programador de respaldos: replicando configuración guardada (schedulerActivo=true).");
                aplicarSchedules(config);
            } else {
                log.info("Programador de respaldos: desactivado en configuración (schedulerActivo=false).");
            }
        });
    }

    /** Llamado cuando el admin guarda la configuración desde la pantalla. */
    public void actualizarSchedules(BackupConfig config) throws SchedulerException {
        if (Boolean.FALSE.equals(config.getSchedulerActivo())) {
            detenerTodos();
            log.info("Programador de respaldos: todos los jobs eliminados (scheduler desactivado).");
            return;
        }
        aplicarSchedules(config);
    }

    private void aplicarSchedules(BackupConfig config) {
        programarJobSeguro(JOB_FULL, TRIGGER_FULL, FullBackupJob.class, config.getCronFull());
        programarJobSeguro(JOB_DIFFERENTIAL, TRIGGER_DIFFERENTIAL, DifferentialBackupJob.class, config.getCronDiferencial());
        programarJobSeguro(JOB_INCREMENTAL, TRIGGER_INCREMENTAL, IncrementalBackupJob.class, config.getCronIncremental());
    }

    private void programarJobSeguro(String jobKey, String triggerKey,
                                  Class<? extends Job> jobClass,
                                  String cron) {
        try {
            programarJob(jobKey, triggerKey, jobClass, cron);
        } catch (SchedulerException e) {
            log.error("No se pudo programar el job de backup [{}] con cron [{}]: {}", jobKey, cron, e.getMessage(), e);
        }
    }

    /**
     * Programación fiable: Quartz a veces deja triggers huérfanos; {@code rescheduleJob} falla si el trigger no existe.
     * Borramos el job (y sus triggers) y lo volvemos a crear.
     */
    private void programarJob(String jobKey, String triggerKey,
                              Class<? extends Job> jobClass,
                              String cron) throws SchedulerException {

        JobKey jk = JobKey.jobKey(jobKey, GROUP);

        if (cron == null || cron.isBlank()) {
            if (scheduler.checkExists(jk)) {
                scheduler.deleteJob(jk);
                log.debug("Job backup [{}] eliminado (sin expresión cron).", jobKey);
            }
            return;
        }

        TriggerKey tk = TriggerKey.triggerKey(triggerKey, GROUP);

        if (scheduler.checkExists(jk)) {
            scheduler.deleteJob(jk);
        }

        JobDetail job = JobBuilder.newJob(jobClass)
                .withIdentity(jk)
                .storeDurably(false)
                .build();

        CronTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(tk)
                .forJob(jk)
                .withSchedule(CronScheduleBuilder
                        .cronSchedule(cron)
                        .inTimeZone(TimeZone.getDefault()))
                .build();

        scheduler.scheduleJob(job, trigger);
        log.info("Backup automático programado: job={}, cron={}, zona={}", jobKey, cron, TimeZone.getDefault().getID());
    }

    public void detenerTodos() throws SchedulerException {
        eliminarJobSiExiste(JOB_FULL);
        eliminarJobSiExiste(JOB_DIFFERENTIAL);
        eliminarJobSiExiste(JOB_INCREMENTAL);
    }

    private void eliminarJobSiExiste(String jobKey) throws SchedulerException {
        JobKey jk = JobKey.jobKey(jobKey, GROUP);
        if (scheduler.checkExists(jk)) {
            scheduler.deleteJob(jk);
        }
    }
}
