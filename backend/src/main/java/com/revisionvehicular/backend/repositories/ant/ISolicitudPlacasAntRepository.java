package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.SolicitudPlacasAnt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISolicitudPlacasAntRepository extends JpaRepository<SolicitudPlacasAnt, Long> {
    List<SolicitudPlacasAnt> findByEstadoOrderByFechaSolicitudDesc(String estado);
}

