package com.revisionvehicular.backend.dtos.rtv;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BajaVehiculoDTO {

    private Long idBaja;

    private Long tramiteId;
    private Long vehiculoId;
    private Long propietarioId;
    private Long entidadId;
    private Long usuarioId;

    private String numeroTramite;
    private String motivoBaja;
    private String descripcionMotivo;

    @Min(value = 1, message = "El ID de inspección debe ser al menos 1")
    private Long inspeccion1Id;

    @Min(value = 1, message = "El ID de inspección debe ser al menos 1")
    private Long inspeccion2Id;

    @Min(value = 1, message = "El ID de inspección debe ser al menos 1")
    private Long inspeccion3Id;

    private String empresaChatarrizado;
    private String certChatarrizado;
    private LocalDate fechaChatarrizado;

    private String ordenJudicial;
    private String constanciaPolicial;

    private String notificadoSri;
    private LocalDate fechaNotificacionSri;

    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaConclusion;
}

