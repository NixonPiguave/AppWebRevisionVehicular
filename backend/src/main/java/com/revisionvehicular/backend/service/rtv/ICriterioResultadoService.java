package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.CriterioResultadoDTO;

public interface ICriterioResultadoService {

    CriterioResultadoDTO obtenerConfig();

    CriterioResultadoDTO guardar(CriterioResultadoDTO dto);

    /**
     * Determina si el resultado debe ser RECHAZADO según los conteos de defectos y la configuración.
     */
    boolean debeRechazar(int totalTipo1, int totalTipo2, int totalTipo3);
}
