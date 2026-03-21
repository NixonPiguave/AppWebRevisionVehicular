package com.revisionvehicular.backend.config;

import org.quartz.spi.TriggerFiredBundle;
import org.springframework.boot.quartz.autoconfigure.SchedulerFactoryBeanCustomizer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

/**
 * Quartz instancia los {@link org.quartz.Job} sin pasar por el contenedor Spring salvo que se
 * configure un {@link org.springframework.scheduling.quartz.SpringBeanJobFactory}.
 * Spring Boot crea uno por defecto, pero este customizer asegura {@code autowireBean} sobre cada
 * ejecución para inyectar {@code IBackupService} en los jobs de respaldo.
 */
@Configuration
public class QuartzConfig {

    @Bean
    public SchedulerFactoryBeanCustomizer autowiringQuartzJobFactoryCustomizer(ApplicationContext applicationContext) {
        return (SchedulerFactoryBean factory) -> {
            SpringBeanJobFactory jobFactory = new SpringBeanJobFactory() {
                @Override
                protected Object createJobInstance(TriggerFiredBundle bundle) throws Exception {
                    Object job = super.createJobInstance(bundle);
                    applicationContext.getAutowireCapableBeanFactory().autowireBean(job);
                    return job;
                }
            };
            jobFactory.setApplicationContext(applicationContext);
            factory.setJobFactory(jobFactory);
        };
    }
}
