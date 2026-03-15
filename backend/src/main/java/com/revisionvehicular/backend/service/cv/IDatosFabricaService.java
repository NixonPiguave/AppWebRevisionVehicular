package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.DatosFabricaDTO;

import java.util.Optional;

public interface IDatosFabricaService {

    /**
     * Busca datos de fábrica por matrícula (placa) del vehículo.
     * La comparación es case-insensitive y sin espacios.
     */
    Optional<DatosFabricaDTO> buscarPorMatricula(String matricula);
}
