package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Defecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IDefectoRepository extends JpaRepository<Defecto, Long> {

    Optional<Defecto> findByCodigo(String codigo);

    @Procedure(procedureName = "sp_insertar_defecto")
    void insertarDefecto(
            @Param("p_codigo") String codigo,
            @Param("p_descripcion") String descripcion,
            @Param("p_puntoDeTrabajo") String puntoDeTrabajo,
            @Param("p_maquinaria") String maquinaria,
            @Param("p_procedimientos") String procedimientos,
            @Param("p_descripciontipo") String descripciontipo,
            @Param("p_observaciones") String observaciones,
            @Param("p_tipo_defecto_id") Long tipoDefectoId,
            @Param("p_subfamilia_id") Long subfamiliaId,
            @Param("p_categoria_id") Long categoriaId,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_defecto")
    void actualizarDefecto(
            @Param("p_defecto_id") Long defectoId,
            @Param("p_codigo") String codigo,
            @Param("p_descripcion") String descripcion,
            @Param("p_puntoDeTrabajo") String puntoDeTrabajo,
            @Param("p_maquinaria") String maquinaria,
            @Param("p_procedimientos") String procedimientos,
            @Param("p_descripciontipo") String descripciontipo,
            @Param("p_observaciones") String observaciones,
            @Param("p_tipo_defecto_id") Long tipoDefectoId,
            @Param("p_subfamilia_id") Long subfamiliaId,
            @Param("p_categoria_id") Long categoriaId,
            @Param("p_estado") String estado
    );
}