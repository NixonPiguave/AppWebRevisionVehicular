package com.revisionvehicular.backend.entities.srtv;
import jakarta.persistence.*;
        import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.descriptor.jdbc.VarbinaryJdbcType;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "srtv_empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "empresa_id")
    private Long empresaId;

    @Column(nullable = false, unique = true)
    private String nombre;
    @Column(nullable = false)
    private String direccion;
    @Column(nullable = false)
    private String telefono;
    @Column(nullable = false)
    private String correo;
    @Column(nullable = true)
    private String logoempresa;
    @Column(nullable = false)
    private String ruc;
    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios = new ArrayList<>();
}
