package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.entities.srtv.Auditoria;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.IAuditoriaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditoriaService {

    private final IAuditoriaRepository auditoriaRepository;

    public AuditoriaService(IAuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    public void registrarAccion(Usuario usuario, String accion) {
        Auditoria auditoria = new Auditoria();
        auditoria.setFecha(LocalDateTime.now());
        auditoria.setUsuario(usuario);
        auditoria.setAccion(accion);
        auditoriaRepository.save(auditoria);
    }
}