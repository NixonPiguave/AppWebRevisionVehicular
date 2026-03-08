package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

@Data
public class OpcionMenuDTO {
    private Long opcionMenuId;
    private String clave;
    private String nombreVisible;
    private String modulo;
    private Integer orden;
}
