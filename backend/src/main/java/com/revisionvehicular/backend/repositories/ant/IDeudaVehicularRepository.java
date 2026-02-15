package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.DeudaVehicular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface IDeudaVehicularRepository extends JpaRepository<DeudaVehicular, Long> {

    @Procedure(name = "sp_insertar_deuda_vehicular")
    void insertar(
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_tipo_deuda") Long idTipoDeuda,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_vencimiento") java.time.LocalDate fechaVencimiento,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_recargo") java.math.BigDecimal montoRecargo,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_estado") String estado,
            @Param("p_fecha_generacion") java.time.LocalDate fechaGeneracion
    );

    @Procedure(name = "sp_actualizar_deuda_vehicular")
    void actualizar(
            @Param("p_id_deuda") Long idDeuda,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_tipo_deuda") Long idTipoDeuda,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_vencimiento") java.time.LocalDate fechaVencimiento,
            @Param("p_monto_original") java.math.BigDecimal montoOriginal,
            @Param("p_monto_recargo") java.math.BigDecimal montoRecargo,
            @Param("p_monto_total") java.math.BigDecimal montoTotal,
            @Param("p_monto_pendiente") java.math.BigDecimal montoPendiente,
            @Param("p_estado") String estado,
            @Param("p_fecha_generacion") java.time.LocalDate fechaGeneracion
    );
}
