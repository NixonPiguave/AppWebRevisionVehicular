package com.revisionvehicular.backend.repositories.backup;

import com.revisionvehicular.backend.entities.backup.BackupConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IBackupConfigRepository extends JpaRepository<BackupConfig, Long> {
    Optional<BackupConfig> findTopByOrderByConfigIdAsc();
}