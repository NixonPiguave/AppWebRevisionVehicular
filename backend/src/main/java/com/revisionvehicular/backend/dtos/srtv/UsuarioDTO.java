package com.revisionvehicular.backend.dtos.srtv;

import com.revisionvehicular.backend.entities.srtv.Area;
import com.revisionvehicular.backend.entities.srtv.Empresa;
import com.revisionvehicular.backend.entities.srtv.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UsuarioDTO {
    private Long usuarioId;

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El apellido es requerido")
    @Size(max = 100)
    private String apellido;

    @NotBlank(message = "El usuario es requerido")
    @Size(max = 50)
    private String usuario;

    private String contrasena;
    private String usuarioBaseDatos;
    private String contrasenaBaseDatos;

    @NotBlank(message = "El documento de identidad es requerido")
    @Pattern(regexp = "^[0-9]{10,13}$", message = "El documento debe contener solo números (10 o 13 dígitos)")
    private String documentoIdentidad;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Ingrese un correo electrónico válido")
    @Size(max = 150)
    private String email;

    private String estado;
    private List<Long> rolesIds;
    private List<RolDTO> roles;

    @NotNull(message = "Debe seleccionar un área")
    @Min(value = 1, message = "Debe seleccionar un área válida")
    private Long areaId;

    @NotNull(message = "Debe seleccionar una empresa")
    @Min(value = 1, message = "Debe seleccionar una empresa válida")
    private Long empresaId;
}
