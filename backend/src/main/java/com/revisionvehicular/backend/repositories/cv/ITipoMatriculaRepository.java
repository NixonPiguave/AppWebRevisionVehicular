package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.TipoMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITipoMatriculaRepository extends JpaRepository<TipoMatricula, Long> {

    @Procedure(procedureName = "sp_tipo_matricula_insertar")
    void spInsertarTipoMatricula(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_tipo_matricula_modificar")
    void spModificarTipoMatricula(
            @Param("p_tipomatricula_id") Long tipoMatriculaId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    Optional<TipoMatricula> findByNombre(String nombre);
}
