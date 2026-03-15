package com.revisionvehicular.backend.repositories.backup;

import com.revisionvehicular.backend.entities.backup.BackupNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface IBackupNotificationRepository extends JpaRepository<BackupNotification, Long> {

    List<BackupNotification> findByLeidaFalseOrderByCreadoEnDesc();

    List<BackupNotification> findAllByOrderByCreadoEnDesc();

    long countByLeidaFalse();

    @Modifying
    @Transactional
    @Query("UPDATE BackupNotification n SET n.leida = true WHERE n.leida = false")
    void marcarTodasComoLeidas();
}