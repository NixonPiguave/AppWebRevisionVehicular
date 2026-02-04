package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.AmbitoOperacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IAmbitoOperacionalRepository extends JpaRepository<AmbitoOperacional, Long> {

    @Procedure(procedureName = "sp_cv_ambito_operacional_insertar")
    void spInsertarAmbitoOperacional(
            @Param("p_estado") String pEstado,
            @Param("p_ambito") String pAmbito,
            @Param("p_descripcion") String pDescripcion
    );

    @Procedure(procedureName = "sp_cv_ambito_operacional_actualizar")
    void spActualizarAmbitoOperacional(
            @Param("p_ambito_operacional_id") Long pAmbitoOperacionalId,
            @Param("p_estado") String pEstado,
            @Param("p_ambito") String pAmbito,
            @Param("p_descripcion") String pDescripcion
    );
    Optional<AmbitoOperacional> findById(Long id);
    Optional<AmbitoOperacional> getByAmbito(String ambito);
}
