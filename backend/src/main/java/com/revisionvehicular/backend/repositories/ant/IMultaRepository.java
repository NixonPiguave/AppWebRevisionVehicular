package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface IMultaRepository extends JpaRepository<Multa, Long> {

    @Procedure(name = "sp_insertar_multa")
    void insertar(
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_propietario") Long idPropietario,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_estado_multa") Long idEstadoMulta,
            @Param("p_numero_citacion") String numeroCitacion,
            @Param("p_fecha_emision") java.time.LocalDateTime fechaEmision,
            @Param("p_fecha_notificacion") java.time.LocalDateTime fechaNotificacion,
            @Param("p_pais") String pais,
            @Param("p_ciudad") String ciudad,
            @Param("p_puntos") String puntos,
            @Param("p_motivo") String motivo,
            @Param("p_monto") java.math.BigDecimal monto,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_multa")
    void actualizar(
            @Param("p_id_multa") Long idMulta,
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_id_propietario") Long idPropietario,
            @Param("p_id_vehiculo") Long idVehiculo,
            @Param("p_id_estado_multa") Long idEstadoMulta,
            @Param("p_numero_citacion") String numeroCitacion,
            @Param("p_fecha_emision") java.time.LocalDateTime fechaEmision,
            @Param("p_fecha_notificacion") java.time.LocalDateTime fechaNotificacion,
            @Param("p_pais") String pais,
            @Param("p_ciudad") String ciudad,
            @Param("p_puntos") String puntos,
            @Param("p_motivo") String motivo,
            @Param("p_monto") java.math.BigDecimal monto,
            @Param("p_estado") String estado
    );
}
