package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DesbloqueoVehiculoDTO {

    private Long idDesbloqueo;

    private Long tramiteId;
    private Long bloqueoId;
    private Long vehiculoId;
    private Long entidadId;
    private Long usuarioDesactivaId;

    private String numeroTramite;
    private String documentoLevantamiento;
    private String motivoLevantamiento;

    private LocalDateTime fechaDesactivacion;
    private String estado;
}

