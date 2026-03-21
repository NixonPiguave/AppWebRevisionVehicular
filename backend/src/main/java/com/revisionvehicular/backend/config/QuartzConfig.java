package com.revisionvehicular.backend.config;

import org.quartz.spi.TriggerFiredBundle;
import org.springframework.boot.quartz.autoconfigure.SchedulerFactoryBeanCustomizer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;


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
