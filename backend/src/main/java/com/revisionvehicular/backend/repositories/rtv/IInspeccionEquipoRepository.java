package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.InspeccionEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IInspeccionEquipoRepository extends JpaRepository<InspeccionEquipo, Long> {

    @Query("SELECT ie FROM InspeccionEquipo ie JOIN FETCH ie.equipo WHERE ie.inspeccion.inspeccion_id = :inspeccionId")
    List<InspeccionEquipo> findByInspeccionId(@Param("inspeccionId") Long inspeccionId);

    @Query("SELECT ie FROM InspeccionEquipo ie JOIN FETCH ie.equipo WHERE ie.inspeccion.inspeccion_id IN :inspeccionIds")
    List<InspeccionEquipo> findByInspeccionIdInWithEquipo(@Param("inspeccionIds") List<Long> inspeccionIds);
}
