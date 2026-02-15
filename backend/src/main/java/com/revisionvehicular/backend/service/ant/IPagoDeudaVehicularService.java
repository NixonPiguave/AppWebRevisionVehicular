package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.PagoDeudaVehicularDTO;
import java.util.List;
import java.util.Optional;

public interface IPagoDeudaVehicularService {

    void crear(PagoDeudaVehicularDTO dto);

    void actualizar(Long id, PagoDeudaVehicularDTO dto);

    List<PagoDeudaVehicularDTO> listar();

    Optional<PagoDeudaVehicularDTO> buscarPorId(Long id);
}
