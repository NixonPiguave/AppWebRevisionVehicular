package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "srtv_area")
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long area_id;

    @Column(nullable = false)
    private String nombre;

    @OneToMany(mappedBy = "area")
    private List<Usuario> usuarios = new ArrayList<>();
}
