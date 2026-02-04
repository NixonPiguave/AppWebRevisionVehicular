package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IServicioRepository extends JpaRepository<Servicio, Long> {

    @Procedure(name = "sp_insertar_servicio")
    Long insertarServicio(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_requiere_revision") String requiereRevision,
            @Param("p_genera_multa") String generaMulta,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_servicio")
    void actualizarServicio(
            @Param("p_id_tipo_tramite") Long idTipoTramite,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_requiere_revision") String requiereRevision,
            @Param("p_genera_multa") String generaMulta,
            @Param("p_estado") String estado
    );
}