package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Familia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IFamiliaRepository extends JpaRepository<Familia, Long> {

    @Procedure(name = "sp_insertar_familia")
    void insertarFamilia(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_familia")
    void actualizarFamilia(
            @Param("p_familia_id") Long familiaId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}