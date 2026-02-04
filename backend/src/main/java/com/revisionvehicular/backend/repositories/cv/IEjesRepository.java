package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Ejes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IEjesRepository extends JpaRepository<Ejes, Long> {

    @Procedure(procedureName = "sp_ejes_insertar")
    void spInsertarEjes(
            @Param("p_cantidad")    Integer cantidad,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado")      String estado
    );

    @Procedure(procedureName = "sp_ejes_modificar")
    void spModificarEjes(
            @Param("p_ejes_id")     Long ejesId,
            @Param("p_cantidad")    Integer cantidad,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado")      String estado
    );

    Optional<Ejes> findById(Long id);

    Optional<Ejes> getByCantidad(Integer cantidad);
}
