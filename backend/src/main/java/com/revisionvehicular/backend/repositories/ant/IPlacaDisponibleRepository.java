package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.PlacaDisponible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPlacaDisponibleRepository extends JpaRepository<PlacaDisponible, Long> {
    boolean existsBySerieAlfanumerica(String serieAlfanumerica);
    List<PlacaDisponible> findByEstadoOrderByFechaRecepcionDesc(String estado);
}

