package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MultaRtvDetalleLineaDTO {

    private Long idMulta;
    private Long idEntidadTransito;
    private String entidadNombre;
    private Long idEstadoMulta;
    private String estadoMultaDescripcion;
    private String numeroCitacion;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaNotificacion;
    private String pais;
    private String ciudad;
    private String puntos;
    private String motivo;
    private BigDecimal monto;
    private String estado;
}
