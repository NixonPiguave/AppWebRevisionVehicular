package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.Impronta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IImprontaRepository extends JpaRepository<Impronta, Long> {

    @Procedure(procedureName = "sp_insertar_impronta")
    void insertarImpronta(
            @Param("p_fecha_registro") LocalDateTime fechaRegistro,
            @Param("p_codigo_impronta") String codigoImpronta,
            @Param("p_descripcion") String descripcion,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_empresa_id") Long empresaId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_actualizar_impronta")
    void actualizarImpronta(
            @Param("p_impronta_id") Long improntaId,
            @Param("p_fecha_registro") LocalDateTime fechaRegistro,
            @Param("p_codigo_impronta") String codigoImpronta,
            @Param("p_descripcion") String descripcion,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_empresa_id") Long empresaId,
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_estado") String estado
    );

    List<Impronta> findByVehiculo_MatriculaContainingIgnoreCase(String matricula);

    Optional<Impronta> findTopByVehiculo_VehiculoidOrderByFechaRegistroDesc(Long vehiculoid);
}