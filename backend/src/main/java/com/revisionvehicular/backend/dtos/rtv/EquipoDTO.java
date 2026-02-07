package com.revisionvehicular.backend.dtos.rtv;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
public class EquipoDTO {
    private Long equipoid;
    private String equipo;
    private String modelo;
    private String serialEquipo;
    private String codigoInterno;
    private LocalDate ultimoMantenimiento;
    private LocalDate ultimaCalibracion;
    private Integer influencia;
    private String estado;
}
