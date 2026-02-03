package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByCodigo(String codigo);

    @Procedure(procedureName = "sp_permiso_insertar")
    Long spInsertarPermiso(
            @Param("p_permiso_id") Long permisoId,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_modulo") String modulo,
            @Param("p_estado") String estado,
            @Param("p_descripcion") String descripcion
    );
    @Procedure(procedureName = "sp_permiso_actualizar")
    void spActualizarPermiso(
            @Param("p_permiso_id") Long permisoId,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_modulo") String modulo,
            @Param("p_estado") String estado,
            @Param("p_descripcion") String descripcion
    );

    @Procedure(procedureName = "sp_permiso_eliminar")
    Boolean spEliminarPermiso(
            @Param("p_permiso_id") Long permisoId,
            @Param("p_eliminado") Boolean eliminado
    );
}