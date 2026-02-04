package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.ModeloVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface IModeloVehiculoRepository extends JpaRepository<ModeloVehiculo, Long> {

    @Procedure(procedureName = "sp_modelo_vehiculo_insertar")
    void spInsertarModeloVehiculo(
            @Param("p_nombre") String nombre,
            @Param("p_anio_desde") Integer anioDesde,
            @Param("p_anio_hasta") Integer anioHasta,
            @Param("p_estado") String estado,
            @Param("p_id_marca") Long idMarca
    );

    @Procedure(procedureName = "sp_modelo_vehiculo_modificar")
    void spModificarModeloVehiculo(
            @Param("p_id_modelo") Long idModelo,
            @Param("p_nombre") String nombre,
            @Param("p_anio_desde") Integer anioDesde,
            @Param("p_anio_hasta") Integer anioHasta,
            @Param("p_estado") String estado,
            @Param("p_id_marca") Long idMarca
    );
    List<ModeloVehiculo> findByMarcaIdMarca(Long idMarca);
    Optional<ModeloVehiculo> findByNombreAndMarca_IdMarca(String nombre, Long idMarca);
}
