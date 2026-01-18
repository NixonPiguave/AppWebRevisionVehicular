package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_rol")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rol_id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @OneToMany(mappedBy = "rol")
    private List<Usuario> usuarios = new ArrayList<>();
}