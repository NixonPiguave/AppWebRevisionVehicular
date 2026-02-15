package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.PagoMultaDTO;
import java.util.List;
import java.util.Optional;

public interface IPagoMultaService {

    void crear(PagoMultaDTO dto);

    void actualizar(Long id, PagoMultaDTO dto);

    List<PagoMultaDTO> listar();

    Optional<PagoMultaDTO> buscarPorId(Long id);
}
