package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnulacionTramiteServicioDTO {

    private Long idAnulacionSrv;
    private Long tramiteAnuladoId;
    private Long entidadId;
    private Long usuarioId;

    private String numeroTramiteAnulado;
    private String estadoTramiteAlAnular;
    private String motivoAnulacion;
    private String documentosSoporte;
    private String pagosRevertidos;
    private String multasDevueltas;
    private String estado;
    private LocalDateTime fechaAnulacion;
}
