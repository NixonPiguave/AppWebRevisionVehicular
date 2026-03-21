package com.revisionvehicular.backend.service.backup.jobs;

import com.revisionvehicular.backend.service.backup.IBackupService;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@DisallowConcurrentExecution
@Component
public class FullBackupJob implements Job {

    @Autowired
    private IBackupService backupService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            backupService.ejecutarBackup("FULL", "AUTOMATICO", null);
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}