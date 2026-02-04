package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.EntidadesTransito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IEntidadesTransitoRepository extends JpaRepository<EntidadesTransito, Long> {

    @Procedure(name = "sp_insertar_entidad_transito")
    void insertarEntidadTransito(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_nivel") String nivel,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_entidad_transito")
    void actualizarEntidadTransito(
            @Param("p_id_entidad") Long idEntidad,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_nivel") String nivel,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}