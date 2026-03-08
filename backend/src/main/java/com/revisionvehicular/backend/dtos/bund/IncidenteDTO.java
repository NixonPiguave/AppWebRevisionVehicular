package com.revisionvehicular.backend.dtos.bund;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidenteDTO {

    private Long idIncidente;
    private Long tramiteId;
    private Long vehiculoId;
    private Long usuarioReportaId;
    private Long usuarioResuelveId;
    private Long entidadId;

    private String numeroIncidente;
    private String tipoIncidente;
    private String descripcion;
    private String documentosSoporte;
    private String areaResponsable;
    private String resolucion;
    private String estado;

    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaResolucion;
}
