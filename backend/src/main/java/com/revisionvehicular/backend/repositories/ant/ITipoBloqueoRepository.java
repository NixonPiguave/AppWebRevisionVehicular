package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.TipoBloqueo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITipoBloqueoRepository extends JpaRepository<TipoBloqueo, Long> {

    @Query("SELECT DISTINCT t.instAutorizada FROM TipoBloqueo t WHERE t.instAutorizada IS NOT NULL AND t.instAutorizada <> '' ORDER BY t.instAutorizada")
    List<String> findDistinctInstAutorizada();
}
