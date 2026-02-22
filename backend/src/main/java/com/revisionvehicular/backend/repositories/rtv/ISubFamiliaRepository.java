package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Subfamilia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ISubFamiliaRepository extends JpaRepository<Subfamilia, Long> {

    @Procedure(procedureName = "sp_subfamilia_insertar")
    void insertarSubfamilia(
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_nombre") String nombre,
            @Param("p_familia_id") Long familiaId
    );

    @Procedure(procedureName = "sp_subfamilia_actualizar")
    void actualizarSubfamilia(
            @Param("p_subfamilia_id") Long subfamiliaId,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_nombre") String nombre,
            @Param("p_familia_id") Long familiaId
    );
}