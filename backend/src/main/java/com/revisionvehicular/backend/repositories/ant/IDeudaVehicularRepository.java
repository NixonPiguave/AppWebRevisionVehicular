package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.DeudaVehicular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IDeudaVehicularRepository extends JpaRepository<DeudaVehicular, Long> {

    @Procedure(procedureName = "sp_insert_ant_deuda_vehicular")
    void insertar(
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_tipo_deuda") String tipoDeuda,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_vencimiento") LocalDate fechaVencimiento,
            @Param("p_monto_original") BigDecimal montoOriginal,
            @Param("p_monto_recargo") BigDecimal montoRecargo,
            @Param("p_monto_total") BigDecimal montoTotal,
            @Param("p_monto_pendiente") BigDecimal montoPendiente,
            @Param("p_estado") String estado,
            @Param("p_fecha_generacion") LocalDate fechaGeneracion
    );

    @Procedure(procedureName = "sp_update_ant_deuda_vehicular")
    void modificar(
            @Param("p_id_deuda") Long idDeuda,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_tipo_deuda") String tipoDeuda,
            @Param("p_periodo") Integer periodo,
            @Param("p_fecha_vencimiento") LocalDate fechaVencimiento,
            @Param("p_monto_original") BigDecimal montoOriginal,
            @Param("p_monto_recargo") BigDecimal montoRecargo,
            @Param("p_monto_total") BigDecimal montoTotal,
            @Param("p_monto_pendiente") BigDecimal montoPendiente,
            @Param("p_estado") String estado,
            @Param("p_fecha_generacion") LocalDate fechaGeneracion
    );
}
