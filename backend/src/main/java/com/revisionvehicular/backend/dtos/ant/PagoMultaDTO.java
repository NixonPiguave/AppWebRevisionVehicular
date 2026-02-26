package com.revisionvehicular.backend.dtos.ant;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PagoMultaDTO {

    private Long idPagoMulta;
    private Long idMulta;
    private LocalDate fechaPago;
    private BigDecimal montoOriginal;
    private BigDecimal montoPagado;
    private BigDecimal montoPendiente;
    private BigDecimal montoTotal;
    private Long idMetodoPago;
    private String estado;
}
