package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RecargoCalendarizacionDTO;
import com.revisionvehicular.backend.entities.rtv.RecargoCalendarizacion;
import com.revisionvehicular.backend.repositories.rtv.IRecargoCalendarizacionRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class RecargoCalendarizacionServiceImpl implements IRecargoCalendarizacionService {

    private static final String CLAVE_MONTO = "monto_recargo";
    private static final BigDecimal DEFAULT = new BigDecimal("25.00");

    private final IRecargoCalendarizacionRepository repository;
    private final AuditoriaService auditoriaService;

    public RecargoCalendarizacionServiceImpl(IRecargoCalendarizacionRepository repository,
                                             AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    public RecargoCalendarizacionDTO obtenerMontoRecargo() {
        Optional<RecargoCalendarizacion> opt = repository.findByClaveAndActivo(CLAVE_MONTO);
        if (opt.isEmpty()) {
            return new RecargoCalendarizacionDTO(null, CLAVE_MONTO, DEFAULT,
                    "Recargo por realizar RTV fuera del mes calendarizado (Art. 12)");
        }
        RecargoCalendarizacion r = opt.get();
        BigDecimal monto;
        try {
            monto = new BigDecimal(r.getValor().trim());
        } catch (Exception e) {
            monto = DEFAULT;
        }
        return new RecargoCalendarizacionDTO(r.getId(), r.getClave(), monto, r.getDescripcion());
    }

    @Override
    public RecargoCalendarizacionDTO actualizarMontoRecargo(BigDecimal monto) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El monto debe ser mayor o igual a cero");
        }
        Optional<RecargoCalendarizacion> opt = repository.findByClaveAndActivo(CLAVE_MONTO);
        RecargoCalendarizacion entidad;
        if (opt.isPresent()) {
            entidad = opt.get();
            entidad.setValor(monto.toPlainString());
        } else {
            entidad = new RecargoCalendarizacion();
            entidad.setClave(CLAVE_MONTO);
            entidad.setValor(monto.toPlainString());
            entidad.setDescripcion("Recargo por realizar RTV fuera del mes calendarizado (Art. 12)");
            entidad.setEstado("ACTIVO");
        }
        RecargoCalendarizacion guardada = repository.save(entidad);
        auditoriaService.registrar("UPDATE", "RecargoCalendarizacion", "Actualizó monto recargo a " + monto);
        return obtenerMontoRecargo();
    }
}
