package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.CapCarga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ICapCargaRepository extends JpaRepository<CapCarga, Long> {

    @Procedure(procedureName = "sp_crear_cap_carga")
    void spCrearCapCarga(
            @Param("p_capacidad")   BigDecimal capacidad,
            @Param("p_unidad")      String unidad,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado")      String estado
    );
    @Procedure(procedureName = "sp_modificar_cap_carga")
    void spModificarCapCarga(
            @Param("p_cap_carga_id") Long idCapCarga,
            @Param("p_capacidad")    BigDecimal capacidad,
            @Param("p_unidad")       String unidad,
            @Param("p_descripcion")  String descripcion,
            @Param("p_estado")       String estado
    );
    Optional<CapCarga> findById(Long id);
    Optional<CapCarga> getCapCargasByCapacidad(BigDecimal capacidad);
}
