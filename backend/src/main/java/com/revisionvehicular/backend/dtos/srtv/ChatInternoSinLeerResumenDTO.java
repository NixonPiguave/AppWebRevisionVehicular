package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ChatInternoSinLeerResumenDTO {
    private long totalSinLeer;
    private List<ChatInternoSinLeerItemDTO> porEmisor = new ArrayList<>();
}
