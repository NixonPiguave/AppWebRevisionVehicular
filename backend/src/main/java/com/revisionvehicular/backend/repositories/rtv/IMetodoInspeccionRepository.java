package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.MetodoInspeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IMetodoInspeccionRepository extends JpaRepository<MetodoInspeccion, Long> {

    @Procedure(name = "sp_insertar_metodo_inspeccion")
    void insertarMetodoInspeccion(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_metodo_inspeccion")
    void actualizarMetodoInspeccion(
            @Param("p_metodo_inspeccion_id") Long metodoInspeccionId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}