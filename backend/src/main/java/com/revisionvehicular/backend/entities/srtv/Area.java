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
