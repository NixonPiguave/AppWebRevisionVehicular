package com.revisionvehicular.backend.repositories.rc;

import com.revisionvehicular.backend.entities.rc.Umbral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface IUmbralRepository extends JpaRepository<Umbral, Long> {

    Optional<Umbral> findTopByUnidadMedida_UmedidaidAndValorMinAndValorMaxAndCalificacionOrderByUmbralidDesc(
            Long unidadId,
            BigDecimal valorMin,
            BigDecimal valorMax,
            Integer calificacion
    );

    @Procedure(procedureName = "sp_umbral_insertar")
    void spInsertarUmbral(
            @Param("p_valor_min") BigDecimal valorMin,
            @Param("p_valor_max") BigDecimal valorMax,
            @Param("p_calificacion") Integer calificacion,
            @Param("p_inc_valor_min") Integer incValorMin,
            @Param("p_inc_valor_max") Integer incValorMax,
            @Param("p_unidad_medida_id") Long unidadMedidaId,
            @Param("p_descrip_umbral_id") Long descripcionUmbralId,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_umbral_actualizar")
    void spActualizarUmbral(
            @Param("p_umbral_id") Long id,
            @Param("p_valor_min") BigDecimal valorMin,
            @Param("p_valor_max") BigDecimal valorMax,
            @Param("p_calificacion") Integer calificacion,
            @Param("p_inc_valor_min") Integer incValorMin,
            @Param("p_inc_valor_max") Integer incValorMax,
            @Param("p_unidad_medida_id") Long unidadMedidaId,
            @Param("p_descrip_umbral_id") Long descripcionUmbralId,
            @Param("p_estado") String estado
    );
}
