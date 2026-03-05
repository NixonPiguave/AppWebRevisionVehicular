package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.RTVCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ICategoriaDefectosRepository extends JpaRepository<RTVCategoria, Long> {

    @Procedure(procedureName = "sp_insertar_rtv_categoria")
    void insertarCategoria(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_subfamilia_id") Long subfamiliaId
    );

    @Procedure(procedureName = "sp_actualizar_rtv_categoria")
    void actualizarCategoria(
            @Param("p_rtvcategoria_id") Long id,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_subfamilia_id") Long subfamiliaId
    );
}