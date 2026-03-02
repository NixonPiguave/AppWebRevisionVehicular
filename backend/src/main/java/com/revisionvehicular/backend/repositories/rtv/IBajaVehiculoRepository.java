package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.BajaVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface IBajaVehiculoRepository extends JpaRepository<BajaVehiculo, Long> {

    @Procedure(procedureName = "sp_insertar_baja_vehiculo")
    void insertarBajaVehiculo(
            @Param("p_id_tramite") Long tramiteId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_motivo_baja") String motivoBaja,
            @Param("p_descripcion_motivo") String descripcionMotivo,
            @Param("p_inspeccion_1_id") Long inspeccion1Id,
            @Param("p_inspeccion_2_id") Long inspeccion2Id,
            @Param("p_inspeccion_3_id") Long inspeccion3Id,
            @Param("p_empresa_chatarrizado") String empresaChatarrizado,
            @Param("p_cert_chatarrizado") String certChatarrizado,
            @Param("p_fecha_chatarrizado") LocalDate fechaChatarrizado,
            @Param("p_orden_judicial") String ordenJudicial,
            @Param("p_constancia_policial") String constanciaPolicial,
            @Param("p_notificado_sri") String notificadoSri,
            @Param("p_fecha_notificacion_sri") LocalDate fechaNotificacionSri,
            @Param("p_estado") String estado,
            @Param("p_fecha_solicitud") LocalDateTime fechaSolicitud,
            @Param("p_fecha_conclusion") LocalDateTime fechaConclusion
    );

    @Procedure(procedureName = "sp_actualizar_baja_vehiculo")
    void actualizarBajaVehiculo(
            @Param("p_id_baja") Long idBaja,
            @Param("p_id_tramite") Long tramiteId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_id_entidad") Long entidadId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_numero_tramite") String numeroTramite,
            @Param("p_motivo_baja") String motivoBaja,
            @Param("p_descripcion_motivo") String descripcionMotivo,
            @Param("p_inspeccion_1_id") Long inspeccion1Id,
            @Param("p_inspeccion_2_id") Long inspeccion2Id,
            @Param("p_inspeccion_3_id") Long inspeccion3Id,
            @Param("p_empresa_chatarrizado") String empresaChatarrizado,
            @Param("p_cert_chatarrizado") String certChatarrizado,
            @Param("p_fecha_chatarrizado") LocalDate fechaChatarrizado,
            @Param("p_orden_judicial") String ordenJudicial,
            @Param("p_constancia_policial") String constanciaPolicial,
            @Param("p_notificado_sri") String notificadoSri,
            @Param("p_fecha_notificacion_sri") LocalDate fechaNotificacionSri,
            @Param("p_estado") String estado,
            @Param("p_fecha_solicitud") LocalDateTime fechaSolicitud,
            @Param("p_fecha_conclusion") LocalDateTime fechaConclusion
    );
}

