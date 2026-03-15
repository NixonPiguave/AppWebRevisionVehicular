package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.BackupRecordDTO;
import com.revisionvehicular.backend.entities.backup.BackupRecord;
import com.revisionvehicular.backend.repositories.backup.IBackupRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BackupRecordServiceImpl implements IBackupRecordService {

    private final IBackupRecordRepository repository;

    public BackupRecordServiceImpl(IBackupRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<BackupRecordDTO> obtenerHistorial() {
        return repository.findAllByOrderByCreadoEnDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BackupRecordDTO> obtenerHistorialPorTipo(String tipo) {
        return repository.findByTipoOrderByCreadoEnDesc(tipo)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BackupRecordDTO obtenerPorId(Long id) {
        BackupRecord record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup no encontrado con id: " + id));
        return toDTO(record);
    }

    @Override
    public boolean hayBackupEnProceso() {
        return repository.existsByEstado("EN_PROCESO");
    }

    private BackupRecordDTO toDTO(BackupRecord record) {
        BackupRecordDTO dto = new BackupRecordDTO();
        dto.setRecordId(record.getRecordId());
        dto.setNombreArchivo(record.getNombreArchivo());
        dto.setTipo(record.getTipo());
        dto.setOrigen(record.getOrigen());
        dto.setRutaServidor(record.getRutaServidor());
        dto.setDriveFileId(record.getDriveFileId());
        dto.setTamanoBytes(record.getTamanoBytes());
        dto.setEstado(record.getEstado());
        dto.setMensajeError(record.getMensajeError());
        dto.setCreadoEn(record.getCreadoEn());
        dto.setFinalizadoEn(record.getFinalizadoEn());
        dto.setEjecutadoPor(record.getEjecutadoPor());
        dto.setTamanoFormateado(formatearTamano(record.getTamanoBytes()));
        if (record.getUsuario() != null) {
            dto.setUsuarioId(record.getUsuario().getUsuarioId());
            dto.setNombreUsuario(record.getUsuario().getNombre() + " " + record.getUsuario().getApellido());
        }
        return dto;
    }

    private String formatearTamano(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}