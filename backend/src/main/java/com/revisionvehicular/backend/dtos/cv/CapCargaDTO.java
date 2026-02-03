package com.revisionvehicular.backend.dtos.cv;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CapCargaDTO {
    private Long id;
    private BigDecimal capacidad;
    private String unidad;
    private String descripcion;
    private String estado;
}
