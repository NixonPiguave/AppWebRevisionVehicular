package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RecargoCalendarizacionDTO;

import java.math.BigDecimal;

public interface IRecargoCalendarizacionService {

    RecargoCalendarizacionDTO obtenerMontoRecargo();
    RecargoCalendarizacionDTO actualizarMontoRecargo(BigDecimal monto);
}
