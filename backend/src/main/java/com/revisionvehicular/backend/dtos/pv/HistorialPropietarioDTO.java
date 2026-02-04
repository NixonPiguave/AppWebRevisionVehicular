package com.revisionvehicular.backend.dtos.pv;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HistorialPropietarioDTO {

    private Long idHistorial;

    private Long idVehiculo;
    private Long idPropietario;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
