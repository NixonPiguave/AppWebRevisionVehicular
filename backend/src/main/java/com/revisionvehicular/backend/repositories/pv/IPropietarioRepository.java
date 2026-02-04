package com.revisionvehicular.backend.repositories.pv;

import com.revisionvehicular.backend.entities.pv.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface IPropietarioRepository extends JpaRepository<Propietario, Long> {

    @Procedure(name = "sp_insertar_propietario")
    void insertarPropietario(
            @Param("p_documento_identidad") String documentoIdentidad,
            @Param("p_nombre") String nombre,
            @Param("p_telefono") Integer telefono,
            @Param("p_correo") String correo,
            @Param("p_direccion") String direccion,
            @Param("p_fecharegistro") LocalDate fecharegistro
    );

    @Procedure(name = "sp_actualizar_propietario")
    void actualizarPropietario(
            @Param("p_propietario_id") Long propietarioId,
            @Param("p_documento_identidad") String documentoIdentidad,
            @Param("p_nombre") String nombre,
            @Param("p_telefono") Integer telefono,
            @Param("p_correo") String correo,
            @Param("p_direccion") String direccion,
            @Param("p_fecharegistro") LocalDate fecharegistro
    );
}