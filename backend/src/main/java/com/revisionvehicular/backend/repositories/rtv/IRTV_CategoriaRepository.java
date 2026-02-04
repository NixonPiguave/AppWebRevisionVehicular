package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.RTV_Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IRTV_CategoriaRepository extends JpaRepository<RTV_Categoria, Long> {

    @Procedure(name = "sp_insertar_rtv_categoria")
    void insertarRtvCategoria(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_subfamilia_id") Long subfamiliaId
    );

    @Procedure(name = "sp_actualizar_rtv_categoria")
    void actualizarRtvCategoria(
            @Param("p_rtvcategoria_id") Long rtvcategoriaId,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_subfamilia_id") Long subfamiliaId
    );
}