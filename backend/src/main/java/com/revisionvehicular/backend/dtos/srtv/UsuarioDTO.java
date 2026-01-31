package com.revisionvehicular.backend.dtos.srtv;

import com.revisionvehicular.backend.entities.srtv.Area;
import com.revisionvehicular.backend.entities.srtv.Empresa;
import com.revisionvehicular.backend.entities.srtv.Rol;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
public class UsuarioDTO {
    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String usuario;
    private String contrasena;
    private String usuarioBaseDatos;
    private String contrasenaBaseDatos;
    private String documentoIdentidad;
    private String email;
    private String estado;
    private List<Long> rolesIds;
    private List<RolDTO> roles;
    Long areaId;
    Long empresaId;
}
