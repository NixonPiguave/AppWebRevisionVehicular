package com.revisionvehicular.backend.dtos.srtv;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifaConCalendarizacionDTO {

    /** Tarifa base del servicio */
    private BigDecimal tarifa;

    /** Recargo por calendarización (0 si está a tiempo) */
    private BigDecimal recargo;

    /** Total a pagar (tarifa + recargo) */
    private BigDecimal total;

    /** OPORTUNO, OPCIONAL o CON_RECARGO */
    private String estadoCalendarizacion;

    /** Mes obligatorio según placa (1-12), -1 si no aplica */
    private int mesObligatorio;

    /** Último dígito de placa usado para calendarización */
    private int ultimoDigitoPlaca;

    /**
     * Si es true, el recargo por calendarización no aplica porque el vehículo tiene bloqueo activo
     * o baja concluida (no debe sancionarse por no presentarse a RTV anual mientras dure esa situación).
     */
    private boolean exentoRecargoRtvPorBloqueoOBaja;
}
