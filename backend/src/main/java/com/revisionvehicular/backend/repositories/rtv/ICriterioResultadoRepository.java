package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.CriterioResultado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICriterioResultadoRepository extends JpaRepository<CriterioResultado, Long> {

    /**
     * Obtiene la configuración activa (la más reciente por ID).
     */
    CriterioResultado findTopByOrderByCriterioIdDesc();
}
