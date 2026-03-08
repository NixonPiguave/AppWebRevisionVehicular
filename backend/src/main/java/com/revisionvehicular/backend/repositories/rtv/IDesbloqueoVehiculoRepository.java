package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.DesbloqueoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IDesbloqueoVehiculoRepository extends JpaRepository<DesbloqueoVehiculo, Long> {

    @Procedure(procedureName = "sp_insertar_desbloqueo_vehiculo")
    void insertarDesbloqueoVehiculo(
            @Param("p_bloqueo_id") Long bloqueoId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_desactiva_id") Long usuarioDesactivaId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_documento_levantamiento") String documentoLevantamiento,
            @Param("p_motivo_levantamiento") String motivoLevantamiento,
            @Param("p_fecha_desactivacion") LocalDateTime fechaDesactivacion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_desbloqueo_vehiculo")
    void actualizarDesbloqueoVehiculo(
            @Param("p_id_desbloqueo") Long idDesbloqueo,
            @Param("p_bloqueo_id") Long bloqueoId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_desactiva_id") Long usuarioDesactivaId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_documento_levantamiento") String documentoLevantamiento,
            @Param("p_motivo_levantamiento") String motivoLevantamiento,
            @Param("p_fecha_desactivacion") LocalDateTime fechaDesactivacion,
            @Param("p_estado") String estado
    );
}

