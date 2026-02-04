package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Turnos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ITurnosRepository extends JpaRepository<Turnos, Long> {

    @Procedure(name = "sp_insertar_turno")
    Integer insertarTurno(
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_estado") String estado,
            @Param("p_id_tipo_tramite") Long idTipoTramite
    );

    @Procedure(name = "sp_actualizar_turno")
    void actualizarTurno(
            @Param("p_turno_id") Long turnoId,
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_estado") String estado,
            @Param("p_id_tipo_tramite") Long idTipoTramite
    );
}