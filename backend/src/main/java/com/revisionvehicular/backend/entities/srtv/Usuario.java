package com.revisionvehicular.backend.entities.srtv;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id")
    private Long usuarioId;
    @Column(nullable = false, length = 50)
    private String nombre;
    @Column(nullable = false, length = 50)
    private String apellido;
    @Column(nullable = false, length = 50)
    private String usuario;
    @Column(nullable = false, length = 50)
    private String contrasena;
    @Column(nullable = false, length = 50)
    private String usuarioBaseDatos;
    @Column(nullable = false, length = 50)
    private String contrasenaBaseDatos;
    @Column(name="documento_identidad",nullable = false, length = 100)
    private String documentoIdentidad;
    @Column(nullable = false, length = 100)
    private String email;
    @Column(nullable = false, length = 100)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;
}
