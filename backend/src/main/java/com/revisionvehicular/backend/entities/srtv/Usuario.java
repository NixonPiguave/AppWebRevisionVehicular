package com.revisionvehicular.backend.entities.srtv;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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
    private Long usuario_id;
    @Column(nullable = false, length = 100)
    private String nombre;
    @Column(nullable = false, length = 100)
    private String apellido;
    @Column(nullable = false, length = 100)
    private String usuario;
    @Column(nullable = true, length = 100)
    private String usuario_bd;
    @Column(nullable = true, length = 500)
    private String contraseña_bd;
    @Column(nullable = false, length = 500)
    private String contraseña;
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
    @JsonIgnore
    private List<Auditoria> auditorias = new ArrayList<>();
}
