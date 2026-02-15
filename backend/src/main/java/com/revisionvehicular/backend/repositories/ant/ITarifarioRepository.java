package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.Tarifario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface ITarifarioRepository extends JpaRepository<Tarifario, Long> {

    @Procedure(name = "sp_insertar_tarifario")
    void insertar(
            @Param("p_valor") Double valor,
            @Param("p_estado") String estado,
            @Param("p_id_categoria") Long idCategoria
    );

    @Procedure(name = "sp_actualizar_tarifario")
    void actualizar(
            @Param("p_id_tarifario") Long idTarifario,
            @Param("p_valor") Double valor,
            @Param("p_estado") String estado,
            @Param("p_id_categoria") Long idCategoria
    );

}
