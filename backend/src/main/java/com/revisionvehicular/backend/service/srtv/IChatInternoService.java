package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.ChatInternoEnviarRequest;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoMensajeDTO;
import com.revisionvehicular.backend.dtos.srtv.ChatInternoSinLeerResumenDTO;

import java.util.List;

public interface IChatInternoService {

    ChatInternoMensajeDTO enviar(ChatInternoEnviarRequest request);

    List<ChatInternoMensajeDTO> conversacionCon(Long otroUsuarioId);

    ChatInternoSinLeerResumenDTO resumenSinLeer();
}
