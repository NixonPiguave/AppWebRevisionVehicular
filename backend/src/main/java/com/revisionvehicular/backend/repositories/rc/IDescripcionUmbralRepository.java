package com.revisionvehicular.backend.repositories.rc;

import com.revisionvehicular.backend.entities.rc.DescripcionUmbral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IDescripcionUmbralRepository
        extends JpaRepository<DescripcionUmbral, Long> {

    @Procedure(procedureName = "sp_descripcion_umbral_insertar")
    void spInsertarDescripcionUmbral(
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_descripcion_umbral_actualizar")
    void spActualizarDescripcionUmbral(
            @Param("p_id") Long id,
            @Param("p_descripcion") String descripcion,
            @Param("p_estado") String estado
    );
}