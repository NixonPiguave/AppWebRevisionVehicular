package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BloqueoVehiculoDTO {

    private Long idBloqueoSrv;

    private Long tramiteId;
    private Long vehiculoId;
    private Long entidadId;
    private Long usuarioActivaId;

    private String numeroTramite;
    private Long tipoBloqueoId;
    private String motivo;
    private String procesosBloqueados;
    private String documentoHabilitante;
    private String institucionOrigen;

    private LocalDateTime fechaActivacion;
    private String estado;
    private String observaciones;
}

