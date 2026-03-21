package com.revisionvehicular.backend.dtos.cv;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VehiculoDTO {
    private Long id;

    @NotNull(message = "Debe seleccionar un propietario")
    private Long propietarioId;

    @NotBlank(message = "La matrícula es obligatoria")
    @Size(max = 20)
    private String matricula;

    private String placaAnterior;
    private String codigoMotor;
    private String numeroMatriculaVehicular;

    @NotBlank(message = "El chasis es obligatorio")
    @Size(max = 50)
    private String chasis;

    @NotBlank(message = "El VIN es obligatorio")
    @Size(max = 50)
    private String vin;

    private Long modeloVehiculoId;
    private String marcaNombre;
    private String modeloNombre;

    @Min(value = 1900, message = "El año de fabricación debe ser al menos 1900")
    @Max(value = 2100, message = "El año de fabricación no puede ser mayor a 2100")
    private Integer anioFabricacion;

    private String color;
    private String estado;

    @NotNull(message = "La capacidad de pasajeros es obligatoria")
    @Min(value = 1, message = "La capacidad de pasajeros debe ser al menos 1")
    @Max(value = 50, message = "La capacidad de pasajeros no puede ser mayor a 50")
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