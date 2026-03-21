package com.revisionvehicular.backend.dtos.pv;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PropietarioDTO {

    private Long idPropietario;

    @NotBlank(message = "El documento de identidad es requerido")
    @Pattern(regexp = "^[0-9]{10,13}$", message = "El documento debe contener solo números (10 o 13 dígitos)")
    private String documentoIdentidad;

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 200)
    private String nombre;

    @Pattern(regexp = "^[0-9]{0,10}$", message = "El teléfono debe contener solo números, máximo 10 dígitos")
    private String telefono;

    @NotBlank(message = "El correo electrónico es requerido")
    @Email(message = "Ingrese un correo electrónico válido")
    @Size(max = 150)
    private String correo;

    @Size(max = 300)
    private String direccion;

    private LocalDate fechaRegistro;
}
