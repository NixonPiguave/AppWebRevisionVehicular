package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor

@Entity
@Table(name = "srtv_usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usuario_id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "usuario_basedatos", nullable = false, length = 100)
    private String usuarioBasedatos;

    @Column(name = "contrasena", nullable = true, length = 500)
    private String contrasena;


    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = true, length = 100)
    private String email;

    @Column(nullable = true, length = 150)
    private String direccion;

    @Column(nullable = false)
    private LocalDateTime fecharegistro;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Auditoria> auditorias = new ArrayList<>();

}
