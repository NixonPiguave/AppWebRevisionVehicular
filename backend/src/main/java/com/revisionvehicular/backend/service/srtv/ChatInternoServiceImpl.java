package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.ChatInternoEnviarRequest;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoMensajeDTO;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoSinLeerItemDTO;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoSinLeerResumenDTO;
import com.revisionvehicular.backend.entities.srtv.ChatInternoMensaje;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.srtv.IChatInternoMensajeRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatInternoServiceImpl implements IChatInternoService {

    private final IChatInternoMensajeRepository mensajeRepository;
    private final IUsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public ChatInternoServiceImpl(IChatInternoMensajeRepository mensajeRepository,
                                  IUsuarioRepository usuarioRepository,
                                  AuditoriaService auditoriaService) {
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    @Transactional
    public ChatInternoMensajeDTO enviar(ChatInternoEnviarRequest request) {
        Usuario emisor = auditoriaService.getUsuarioActual()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida"));

        if (request.getReceptorId() == null || request.getReceptorId().equals(emisor.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puede enviarse mensajes a sí mismo");
        }

        Usuario receptor = usuarioRepository.findById(request.getReceptorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario destinatario no encontrado"));

        ChatInternoMensaje m = new ChatInternoMensaje();
        m.setEmisor(emisor);
        m.setReceptor(receptor);
        m.setContenido(request.getContenido().trim());
        m.setCreadoEn(LocalDateTime.now());
        m = mensajeRepository.save(m);

        return toDto(m, emisor.getUsuarioId());
    }

    @Override
    @Transactional
    public List<ChatInternoMensajeDTO> conversacionCon(Long otroUsuarioId) {
        Usuario yo = auditoriaService.getUsuarioActual()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida"));

        if (otroUsuarioId == null || otroUsuarioId.equals(yo.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conversación no válida");
        }

        if (!usuarioRepository.existsById(otroUsuarioId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        Long miId = yo.getUsuarioId();
        mensajeRepository.marcarLeidosEnConversacion(miId, otroUsuarioId, LocalDateTime.now());

        return mensajeRepository.findConversacion(miId, otroUsuarioId).stream()
                .map(m -> toDto(m, miId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatInternoSinLeerResumenDTO resumenSinLeer() {
        Usuario yo = auditoriaService.getUsuarioActual()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida"));

        ChatInternoSinLeerResumenDTO res = new ChatInternoSinLeerResumenDTO();
        List<Object[]> rows = mensajeRepository.contarSinLeerPorEmisor(yo.getUsuarioId());
        List<ChatInternoSinLeerItemDTO> items = new ArrayList<>();
        long total = 0;
        for (Object[] row : rows) {
            if (row[0] == null || row[1] == null) continue;
            long emisorId = ((Number) row[0]).longValue();
            long cnt = ((Number) row[1]).longValue();
            total += cnt;
            items.add(new ChatInternoSinLeerItemDTO(emisorId, cnt));
        }
        res.setTotalSinLeer(total);
        res.setPorEmisor(items);
        return res;
    }

    private static ChatInternoMensajeDTO toDto(ChatInternoMensaje m, Long miUsuarioId) {
        Long emisorId = m.getEmisor().getUsuarioId();
        return new ChatInternoMensajeDTO(
                m.getMensajeId(),
                emisorId,
                m.getReceptor().getUsuarioId(),
                m.getContenido(),
                m.getCreadoEn(),
                m.getLeidoEn(),
                emisorId.equals(miUsuarioId)
        );
    }
}
