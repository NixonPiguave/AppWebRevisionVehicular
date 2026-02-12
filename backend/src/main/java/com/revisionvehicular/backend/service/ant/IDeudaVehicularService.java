package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.DeudaVehicularDTO;
import java.util.List;
import java.util.Optional;

public interface IDeudaVehicularService {

    void crear(DeudaVehicularDTO dto);

    void actualizar(Long id, DeudaVehicularDTO dto);

    List<DeudaVehicularDTO> listar();

    Optional<DeudaVehicularDTO> buscarPorId(Long id);
}
