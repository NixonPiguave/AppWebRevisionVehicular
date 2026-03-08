package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistroObservacionDTO {

    private Long idObservacionSrv;
    private Long tramiteId;
    private Long vehiculoId;
    private Long entidadId;
    private Long usuarioId;
    private Long bloqueoCobyId;

    private String numeroTramite;
    private String tipoObservacion;
    private String descripcion;
    private String documentoSoporte;
    private String generaBloqueoCoby;
    private String estado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaLevantamiento;
    private String motivoLevantamiento;
}
