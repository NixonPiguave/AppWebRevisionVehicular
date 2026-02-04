package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.MarcaVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IMarcaVehiculoRepository extends JpaRepository<MarcaVehiculo, Long> {

    @Procedure(procedureName = "sp_marca_vehiculo_insertar")
    void spInsertarMarcaVehiculo(
            @Param("p_nombre")           String nombre,
            @Param("p_empresa")          String empresa,
            @Param("p_pais_origen")      String paisOrigen,
            @Param("p_grupo_automotriz") String grupoAutomotriz,
            @Param("p_fecha_alta")       java.time.LocalDate fechaAlta,
            @Param("p_fecha_baja")       java.time.LocalDate fechaBaja,
            @Param("p_logo_url")         String logoUrl,
            @Param("p_estado")           String estado
    );

    @Procedure(procedureName = "sp_marca_vehiculo_modificar")
    void spModificarMarcaVehiculo(
            @Param("p_id_marca")         Long idMarca,
            @Param("p_nombre")           String nombre,
            @Param("p_empresa")          String empresa,
            @Param("p_pais_origen")      String paisOrigen,
            @Param("p_grupo_automotriz") String grupoAutomotriz,
            @Param("p_fecha_alta")       java.time.LocalDate fechaAlta,
            @Param("p_fecha_baja")       java.time.LocalDate fechaBaja,
            @Param("p_logo_url")         String logoUrl,
            @Param("p_estado")           String estado
    );

    Optional<MarcaVehiculo> findByNombre(String nombre);

}
