package com.revisionvehicular.backend.dtos.rtv;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class EquipoDTO {
    private Long equipoid;
    private String equipo;
    private String modelo;
    private String serialEquipo;
    private String codigoInterno;
    private LocalDateTime ultimoMantenimiento;
    private LocalDateTime ultimaCalibracion;
    private Integer influencia;
    private String estado;
}
