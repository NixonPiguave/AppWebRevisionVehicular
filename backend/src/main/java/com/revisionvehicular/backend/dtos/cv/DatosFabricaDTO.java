package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;

@Data
public class DatosFabricaDTO {
    private Long id;
    private String matricula;
    private String chasis;
    private String vin;
    private String marca;
    private String modelo;
    private String color;
    private Integer anioFabricacion;
}
