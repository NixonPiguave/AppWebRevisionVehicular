package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TipoDeudaVehicularDTO;

import java.util.List;
import java.util.Optional;

public interface ITipoDeudaVehicularService {

    void crear(TipoDeudaVehicularDTO dto);

    void actualizar(Long id, TipoDeudaVehicularDTO dto);

    void eliminar(Long id);

    List<TipoDeudaVehicularDTO> listar();

    Optional<TipoDeudaVehicularDTO> buscarPorId(Long id);
}
