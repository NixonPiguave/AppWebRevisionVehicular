package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.ChatInternoEditarRequest;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ChatInternoServiceImpl implements IChatInternoService {

    private static final String TIPO_TEXTO = "TEXTO";
    private static final String TIPO_IMAGEN = "IMAGEN";

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

        String tipo = normalizarTipo(request.getTipo());
        if (TIPO_IMAGEN.equals(tipo)) {
            String c = request.getContenido().trim();
            if (!c.startsWith("http://") && !c.startsWith("https://")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La imagen debe enviarse como URL (https)");
            }
        }

        ChatInternoMensaje m = new ChatInternoMensaje();
        m.setEmisor(emisor);
        m.setReceptor(receptor);
        m.setContenido(request.getContenido().trim());
        m.setTipo(tipo);
        m.setCreadoEn(LocalDateTime.now());
        if (TIPO_IMAGEN.equals(tipo)) {
            String leg = request.getLeyenda() != null ? request.getLeyenda().trim() : "";
            m.setLeyenda(leg.isEmpty() ? null : leg);
        } else {
            m.setLeyenda(null);
        }

        if (request.getRespuestaAMensajeId() != null) {
            ChatInternoMensaje ref = mensajeRepository.findById(request.getRespuestaAMensajeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mensaje citado no existe"));
            validarMismaConversacion(ref, emisor.getUsuarioId(), receptor.getUsuarioId());
            m.setRespuestaA(ref);
        }

        m = mensajeRepository.save(m);

        return toDto(m, emisor.getUsuarioId());
    }

    @Override
    @Transactional
    public ChatInternoMensajeDTO editarMensaje(Long mensajeId, ChatInternoEditarRequest body) {
        Usuario yo = auditoriaService.getUsuarioActual()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida"));
        ChatInternoMensaje m = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mensaje no encontrado"));
        if (!m.getEmisor().getUsuarioId().equals(yo.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puede editar sus propios mensajes");
        }
        if (TIPO_IMAGEN.equals(m.getTipo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pueden editar mensajes de imagen");
        }
        m.setContenido(body.getContenido().trim());
        m.setEditadoEn(LocalDateTime.now());
        m = mensajeRepository.save(m);
        return toDto(m, yo.getUsuarioId());
    }

    private static void validarMismaConversacion(ChatInternoMensaje ref, Long a, Long b) {
        Long e = ref.getEmisor().getUsuarioId();
        Long r = ref.getReceptor().getUsuarioId();
        boolean ok = (Objects.equals(e, a) && Objects.equals(r, b)) || (Objects.equals(e, b) && Objects.equals(r, a));
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mensaje citado no pertenece a esta conversación");
        }
    }

    private static String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return TIPO_TEXTO;
        }
        String t = tipo.trim().toUpperCase();
        if (TIPO_TEXTO.equals(t) || "TEXT".equalsIgnoreCase(t)) {
            return TIPO_TEXTO;
        }
        if (TIPO_IMAGEN.equals(t) || "IMAGE".equalsIgnoreCase(t)) {
            return TIPO_IMAGEN;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tipo debe ser TEXTO o IMAGEN");
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
            if (row[0] == null || row[1] == null) {
                continue;
            }
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
        ChatInternoMensajeDTO dto = new ChatInternoMensajeDTO();
        dto.setMensajeId(m.getMensajeId());
        dto.setEmisorId(emisorId);
        dto.setReceptorId(m.getReceptor().getUsuarioId());
        dto.setContenido(m.getContenido());
        dto.setTipo(m.getTipo() != null ? m.getTipo() : TIPO_TEXTO);
        dto.setLeyenda(m.getLeyenda());
        dto.setCreadoEn(m.getCreadoEn());
        dto.setLeidoEn(m.getLeidoEn());
        dto.setEditadoEn(m.getEditadoEn());
        dto.setEnviadoPorMi(emisorId.equals(miUsuarioId));
        if (m.getRespuestaA() != null) {
            ChatInternoMensaje r = m.getRespuestaA();
            dto.setRespuestaAMensajeId(r.getMensajeId());
            dto.setRespuestaTipo(r.getTipo() != null ? r.getTipo() : TIPO_TEXTO);
            dto.setRespuestaVistaPrevia(vistaPreviaRespuesta(r));
        }
        return dto;
    }

    private static String vistaPreviaRespuesta(ChatInternoMensaje ref) {
        if (TIPO_IMAGEN.equals(ref.getTipo())) {
            String leg = ref.getLeyenda();
            if (leg != null && !leg.isBlank()) {
                return leg.length() > 120 ? leg.substring(0, 117) + "…" : leg;
            }
            return "[Foto]";
        }
        String c = ref.getContenido();
        if (c == null) {
            return "";
        }
        return c.length() > 120 ? c.substring(0, 117) + "…" : c;
    }
}
