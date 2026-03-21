package com.revisionvehicular.backend.dtos.srtv;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmpresaDTO {
    private Long empresaId;

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 200)
    private String nombre;

    @Size(max = 300)
    private String direccion;

    @Pattern(regexp = "^[0-9]{0,10}$", message = "El teléfono debe contener solo números, máximo 10 dígitos")
    private String telefono;

    @Email(message = "Ingrese un correo electrónico válido")
    @Size(max = 150)
    private String correo;

    private String logoempresa;

    @Pattern(regexp = "^[0-9]{0,13}$", message = "El RUC debe contener solo números, máximo 13 dígitos")
    private String ruc;

    private String iconoempresa;
}
