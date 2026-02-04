package com.revisionvehicular.backend.repositories.rc;

import com.revisionvehicular.backend.entities.rc.UnidadMedida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IUnidadesMedidaRepository extends JpaRepository<UnidadMedida, Long> {

    @Procedure(name = "sp_insertar_unidad_medida")
    void insertarUnidadMedida(
            @Param("p_nombre") String nombre,
            @Param("p_simbolo") String simbolo,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_unidad_medida")
    void actualizarUnidadMedida(
            @Param("p_umedida_id") Long umedidaId,
            @Param("p_nombre") String nombre,
            @Param("p_simbolo") String simbolo,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}