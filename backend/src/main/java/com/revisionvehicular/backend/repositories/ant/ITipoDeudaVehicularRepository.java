package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.TipoDeudaVehicular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITipoDeudaVehicularRepository extends JpaRepository<TipoDeudaVehicular, Long> {

    @Procedure(procedureName = "sp_tipo_deuda_vehicular_insertar")
    void spInsertarTipoDeudaVehicular(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_tipo_deuda_vehicular_actualizar")
    void spActualizarTipoDeudaVehicular(
            @Param("p_id_tipo_deuda") Long idTipoDeuda,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    Optional<TipoDeudaVehicular> findByCodigo(String codigo);

}
