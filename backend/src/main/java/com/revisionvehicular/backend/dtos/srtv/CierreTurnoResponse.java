package com.revisionvehicular.backend.dtos.srtv;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CierreTurnoResponse {
    private String resultado;       // APROBADO | CONDICIONAL
    private TurnosDTO turno;
    private Long adhesivoId;        // Solo si APROBADO
}
