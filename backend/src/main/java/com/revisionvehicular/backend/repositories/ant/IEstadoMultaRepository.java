package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.EstadoMulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IEstadoMultaRepository extends JpaRepository<EstadoMulta, Long> {

    @Procedure(name = "sp_insertar_estado_multa")
    void insertarEstadoMulta(
            @Param("p_tipo_multa") String tipoMulta,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_estado_multa")
    void actualizarEstadoMulta(
            @Param("p_id_estado_multa") Long idEstadoMulta,
            @Param("p_tipo_multa") String tipoMulta,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}