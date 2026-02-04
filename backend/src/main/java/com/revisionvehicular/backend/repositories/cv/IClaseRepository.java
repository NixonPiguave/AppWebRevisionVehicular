package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IClaseRepository extends JpaRepository<Clase, Long> {

    @Procedure(procedureName = "sp_clase_insertar")
    void spInsertarClase(
            @Param("p_clase")       String clase,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado")      String estado
    );

    @Procedure(procedureName = "sp_clase_modificar")
    void spModificarClase(
            @Param("p_clase_id")    Long claseId,
            @Param("p_clase")       String clase,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado")      String estado
    );

    Optional<Clase> findById(Long id);
    Optional<Clase> getByClase(String clase);
}
