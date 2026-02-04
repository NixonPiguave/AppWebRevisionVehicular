package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IVehiculoRepository extends JpaRepository<Vehiculo, Long> {

    @Procedure(procedureName = "sp_vehiculo_insertar")
    void spInsertarVehiculo(
            @Param("p_id_propietario") Long propietarioId,
            @Param("p_chasis") String chasis,
            @Param("p_vin") String vin,
            @Param("p_id_modelo") Long modeloId,
            @Param("p_anio_fabricacion") Integer anioFabricacion,
            @Param("p_color") String color,
            @Param("p_estado_vehiculo") String estadoVehiculo,
            @Param("p_capacidad_pasajeros") Integer capacidadPasajeros,
            @Param("p_tipo_vehiculo_id") Long tipoVehiculoId,
            @Param("p_cap_carga_id") Long capCargaId,
            @Param("p_ambito_operacional_id") Long ambitoOperacionalId,
            @Param("p_ejes_id") Long ejesId,
            @Param("p_traccion_id") Long traccionId,
            @Param("p_tipo_combustible_id") Long tipoCombustibleId,
            @Param("p_tipo_matricula_id") Long tipoMatriculaId,
            @Param("p_subcategoria_id") Long subcategoriaId
    );

    @Procedure(procedureName = "sp_vehiculo_modificar")
    void spModificarVehiculo(
            @Param("p_vehiculo_id") Long vehiculoId,
            @Param("p_id_propietario") Long propietarioId,
            @Param("p_chasis") String chasis,
            @Param("p_vin") String vin,
            @Param("p_id_modelo") Long modeloId,
            @Param("p_anio_fabricacion") Integer anioFabricacion,
            @Param("p_color") String color,
            @Param("p_estado_vehiculo") String estadoVehiculo,
            @Param("p_capacidad_pasajeros") Integer capacidadPasajeros,
            @Param("p_tipo_vehiculo_id") Long tipoVehiculoId,
            @Param("p_cap_carga_id") Long capCargaId,
            @Param("p_ambito_operacional_id") Long ambitoOperacionalId,
            @Param("p_ejes_id") Long ejesId,
            @Param("p_traccion_id") Long traccionId,
            @Param("p_tipo_combustible_id") Long tipoCombustibleId,
            @Param("p_tipo_matricula_id") Long tipoMatriculaId,
            @Param("p_subcategoria_id") Long subcategoriaId
    );

    Optional<Vehiculo> findByChasis(String chasis);
    Optional<Vehiculo> findByVin(String vin);
}
