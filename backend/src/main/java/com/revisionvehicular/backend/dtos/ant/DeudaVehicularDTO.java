package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DeudaVehicularDTO {

    private Long idDeuda;

    private Long idVehiculo;
    private Long idEntidadTransito;

    private String tipoDeuda;
    private Integer periodo;

    private LocalDate fechaVencimiento;

    private BigDecimal montoOriginal;
    private BigDecimal montoRecargo;
    private BigDecimal montoTotal;
    private BigDecimal montoPendiente;

    private String estado;
    private LocalDate fechaGeneracion;
}
