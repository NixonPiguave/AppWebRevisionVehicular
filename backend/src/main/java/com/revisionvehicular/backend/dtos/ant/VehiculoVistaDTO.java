package com.revisionvehicular.backend.dtos.ant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoVistaDTO {

    private Long vehiculoId;
    private String matricula;
    private String chasis;
    private String vin;
    private String codigoMotor;
    private Integer anioFabricacion;
    private String marcaNombre;
    private String modeloNombre;
}
