package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.BloqueoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface IBloqueoVehiculoRepository extends JpaRepository<BloqueoVehiculo, Long> {

    boolean existsByVehiculoVehiculoidAndEstadoIgnoreCase(Long vehiculoid, String estado);

    @Procedure(procedureName = "sp_insertar_bloqueo_vehiculo")
    void insertarBloqueoVehiculo(
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_activa_id") Long usuarioActivaId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_tipo_bloqueo_id") Long tipoBloqueoId,
            @Param("p_motivo") String motivo,
            @Param("p_procesos_bloqueados") String procesosBloqueados,
            @Param("p_documento_habilitante") String documentoHabilitante,
            @Param("p_institucion_origen") String institucionOrigen,
            @Param("p_fecha_activacion") LocalDateTime fechaActivacion,
            @Param("p_estado") String estado,
            @Param("p_observaciones") String observaciones
    );

    @Procedure(procedureName = "sp_actualizar_bloqueo_vehiculo")
    void actualizarBloqueoVehiculo(
            @Param("p_id_bloqueo_srv") Long idBloqueoSrv,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_activa_id") Long usuarioActivaId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_tipo_bloqueo_id") Long tipoBloqueoId,
            @Param("p_motivo") String motivo,
            @Param("p_procesos_bloqueados") String procesosBloqueados,
            @Param("p_documento_habilitante") String documentoHabilitante,
            @Param("p_institucion_origen") String institucionOrigen,
            @Param("p_fecha_activacion") LocalDateTime fechaActivacion,
            @Param("p_estado") String estado,
            @Param("p_observaciones") String observaciones
    );
}

