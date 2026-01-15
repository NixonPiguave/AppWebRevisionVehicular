package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "srtv_empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long empresa_id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios = new ArrayList<>();
}
