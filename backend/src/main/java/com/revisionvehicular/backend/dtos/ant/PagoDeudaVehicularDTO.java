package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoDeudaVehicularDTO {

    private Long idPagoDeuda;

    private Long idDeudaVehicular;

    private LocalDateTime fechaPago;

    private BigDecimal montoOriginal;
    private BigDecimal montoPagado;
    private BigDecimal montoPendiente;
    private BigDecimal montoTotal;

    private String metodoPago;
    private String estado;
}
