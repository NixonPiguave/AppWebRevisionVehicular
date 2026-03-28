package com.revisionvehicular.backend.controllers.srtv;

import com.revisionvehicular.backend.dtos.srtv.ChatInternoEnviarRequest;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoMensajeDTO;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoSinLeerResumenDTO;
import com.revisionvehicular.backend.service.srtv.IChatInternoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-interno")
public class ChatInternoController {

    private final IChatInternoService chatInternoService;

    public ChatInternoController(IChatInternoService chatInternoService) {
        this.chatInternoService = chatInternoService;
    }

    @PostMapping("/enviar")
    public ResponseEntity<ChatInternoMensajeDTO> enviar(@Valid @RequestBody ChatInternoEnviarRequest body) {
        return ResponseEntity.ok(chatInternoService.enviar(body));
    }

    @GetMapping("/conversacion/{otroUsuarioId}")
    public ResponseEntity<List<ChatInternoMensajeDTO>> conversacion(@PathVariable Long otroUsuarioId) {
        return ResponseEntity.ok(chatInternoService.conversacionCon(otroUsuarioId));
    }

    @GetMapping("/sin-leer")
    public ResponseEntity<ChatInternoSinLeerResumenDTO> sinLeer() {
        return ResponseEntity.ok(chatInternoService.resumenSinLeer());
    }
}
