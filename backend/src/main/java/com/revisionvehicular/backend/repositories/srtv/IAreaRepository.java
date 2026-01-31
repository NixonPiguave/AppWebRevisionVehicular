package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IAreaRepository extends JpaRepository<Area, Long>{
    Optional<Area> findById(Long id);
    Optional<Area> getByNombre(String nombre);
    @Procedure(procedureName = "sp_area_insertar")
    void spAreaInsertar(
            @Param("p_nombre") String pnombre,
            @Param("p_estado") String pestado
    );

}
