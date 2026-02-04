package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.TipoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITipoVehiculoRepository extends JpaRepository<TipoVehiculo, Long> {

    @Procedure(procedureName = "sp_tipo_vehiculo_insertar")
    void spInsertarTipoVehiculo(
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_clase_id") Long claseId
    );

    @Procedure(procedureName = "sp_tipo_vehiculo_modificar")
    void spModificarTipoVehiculo(
            @Param("p_tipovehiculo_id") Long tipoVehiculoId,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado,
            @Param("p_clase_id") Long claseId
    );

    Optional<TipoVehiculo> findByNombre(String nombre);
}
