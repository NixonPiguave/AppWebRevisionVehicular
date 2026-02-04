package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.TipoCombustible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITipoCombustibleRepository extends JpaRepository<TipoCombustible, Long> {

    @Procedure(procedureName = "sp_tipo_combustible_insertar")
    void spInsertarTipoCombustible(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_tipo_combustible_modificar")
    void spModificarTipoCombustible(
            @Param("p_tipocombustible_id") Long tipoCombustibleId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    Optional<TipoCombustible> findByNombre(String nombre);
}
