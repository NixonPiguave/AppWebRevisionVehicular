package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.TipoDefecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITipoDefectoRepository extends JpaRepository<TipoDefecto, Long> {

    @Procedure(procedureName = "sp_tipo_defecto_insertar")
    void spInsertarTipoDefecto(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_tipo_defecto_modificar")
    void spModificarTipoDefecto(
            @Param("p_tipo_defecto_id") Long tipoDefectoId,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    Optional<TipoDefecto> findByCodigo(String codigo);
}
