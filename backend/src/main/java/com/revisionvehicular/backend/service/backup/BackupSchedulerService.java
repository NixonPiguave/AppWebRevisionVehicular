package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.entities.backup.BackupConfig;
import com.revisionvehicular.backend.repositories.backup.IBackupConfigRepository;
import com.revisionvehicular.backend.service.backup.jobs.DifferentialBackupJob;
import com.revisionvehicular.backend.service.backup.jobs.FullBackupJob;
import com.revisionvehicular.backend.service.backup.jobs.IncrementalBackupJob;
import jakarta.annotation.PostConstruct;
import org.quartz.*;
import org.springframework.stereotype.Service;

@Service
public class BackupSchedulerService {

    private static final String GROUP = "backup-group";

    private static final String JOB_FULL         = "job-full";
    private static final String JOB_DIFFERENTIAL = "job-differential";
    private static final String JOB_INCREMENTAL  = "job-incremental";

    private static final String TRIGGER_FULL         = "trigger-full";
    private static final String TRIGGER_DIFFERENTIAL = "trigger-differential";
    private static final String TRIGGER_INCREMENTAL  = "trigger-incremental";

    private final Scheduler scheduler;
    private final IBackupConfigRepository configRepository;

    public BackupSchedulerService(Scheduler scheduler,
                                  IBackupConfigRepository configRepository) {
        this.scheduler = scheduler;
        this.configRepository = configRepository;
    }

    // Al arrancar la aplicación, retoma la configuración guardada en BD
    @PostConstruct
    public void inicializar() {
        configRepository.findTopByOrderByConfigIdDesc().ifPresent(config -> {
            try {
                if (Boolean.TRUE.equals(config.getSchedulerActivo())) {
                    aplicarSchedules(config);
                }
            } catch (Exception e) {
                // Log pero no interrumpir el arranque
                System.err.println("Error al inicializar scheduler de backups: " + e.getMessage());
            }
        });
    }

    // Llamado cuando el admin guarda la configuración desde la pantalla
    public void actualizarSchedules(BackupConfig config) throws SchedulerException {
        if (Boolean.FALSE.equals(config.getSchedulerActivo())) {
            detenerTodos();
            return;
        }
        aplicarSchedules(config);
    }

    private void aplicarSchedules(BackupConfig config) throws SchedulerException {
        programarJob(JOB_FULL, TRIGGER_FULL,
                FullBackupJob.class, config.getCronFull());

        programarJob(JOB_DIFFERENTIAL, TRIGGER_DIFFERENTIAL,
                DifferentialBackupJob.class, config.getCronDiferencial());

        programarJob(JOB_INCREMENTAL, TRIGGER_INCREMENTAL,
                IncrementalBackupJob.class, config.getCronIncremental());
    }

    private void programarJob(String jobKey, String triggerKey,
                              Class<? extends Job> jobClass,
                              String cron) throws SchedulerException {

        // Si no hay cron configurado para este tipo, solo pausar si existía
        if (cron == null || cron.isBlank()) {
            pausarJob(jobKey);
            return;
        }

        JobKey jk = JobKey.jobKey(jobKey, GROUP);
        TriggerKey tk = TriggerKey.triggerKey(triggerKey, GROUP);

        if (scheduler.checkExists(jk)) {
            CronTrigger nuevoTrigger = TriggerBuilder.newTrigger()
                    .withIdentity(tk)
                    .withSchedule(CronScheduleBuilder.cronSchedule(cron))
                    .build();
            scheduler.rescheduleJob(tk, nuevoTrigger);
        } else {
            // Crear job y trigger nuevos
            JobDetail job = JobBuilder.newJob(jobClass)
                    .withIdentity(jk)
                    .storeDurably()
                    .build();

            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(tk)
                    .withSchedule(CronScheduleBuilder.cronSchedule(cron))
                    .build();

            scheduler.scheduleJob(job, trigger);
        }

        // Reanudar por si estaba pausado
        scheduler.resumeJob(jk);
    }

    private void pausarJob(String jobKey) {
        try {
            scheduler.pauseJob(JobKey.jobKey(jobKey, GROUP));
        } catch (SchedulerException ignored) {}
    }

    public void detenerTodos() throws SchedulerException {
        pausarJob(JOB_FULL);
        pausarJob(JOB_DIFFERENTIAL);
        pausarJob(JOB_INCREMENTAL);
    }
}