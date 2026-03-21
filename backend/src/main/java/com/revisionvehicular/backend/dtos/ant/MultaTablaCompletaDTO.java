package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Campos de ant_multa + etiquetas de relaciones para la vista detalle. */
@Data
public class MultaTablaCompletaDTO {

    private Long idMulta;
    private Long idEntidad;
    private String entidadNombre;
    private Long idPropietario;
    private Long idVehiculo;
    private Long idEstadoMulta;
    private String estadoMultaTipo;
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
