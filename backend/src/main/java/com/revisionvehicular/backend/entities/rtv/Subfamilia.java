package com.revisionvehicular.backend.entities.rtv;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rtv_subfamilia")
@Data
public class Subfamilia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subfamilia_id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "familia_id", nullable = false)
    private Familia familia;

    @Column(length = 50)
    private String estado;

}