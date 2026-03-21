package com.revisionvehicular.backend.dtos.ant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultaRtvDetalleCompletoDTO {

    private PropietarioVistaDTO propietario;
    private VehiculoVistaDTO vehiculo;
    private List<MultaTablaCompletaDTO> multas;
}
