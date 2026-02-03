package com.revisionvehicular.backend.dtos.cv;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VehiculoDTO {

    private Long id;

    private Long propietarioId;

    private String matricula;
    private String chasis;
    private String vin;

    private Long modeloVehiculoId;

    private Integer anioFabricacion;
    private String color;

    private LocalDate fechaAltaRegistro;
    private LocalDate fechaMatricula;

    private String estado;

    private Integer capacidadPasajeros;

    private Long tipoVehiculoId;
    private Long capCargaId;
    private Long ambitoOperacionalId;
    private Long ejesId;
    private Long traccionId;
    private Long tipoCombustibleId;
    private Long tipoMatriculaId;
    private Long subcategoriaId;
}

