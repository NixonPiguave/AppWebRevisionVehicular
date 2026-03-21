package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import com.revisionvehicular.backend.repositories.ant.ICalendarizacionRepository;
import com.revisionvehicular.backend.repositories.rtv.IRecargoCalendarizacionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calendarización RTV según Art. 12 - Ecuador.
 * Lee desde ant_calendarizacion_matriculacion (tipo 3 = RTV).
 * Enero: opcional para todos. Diciembre: todos con recargo.
 */
@Service
public class CalendarizacionRtvService {

    private static final int TIPO_RTV = 3;
    private static final BigDecimal MONTO_RECARGO_DEFAULT = new BigDecimal("25.00");

    private final IRecargoCalendarizacionRepository recargoRepository;
    private final ICalendarizacionRepository calendarizacionRepository;

    public CalendarizacionRtvService(IRecargoCalendarizacionRepository recargoRepository,
                                     ICalendarizacionRepository calendarizacionRepository) {
        this.recargoRepository = recargoRepository;
        this.calendarizacionRepository = calendarizacionRepository;
    }

    /**
     * Obtiene el último dígito de la placa (0-9).
     * Si la placa es null/vacía o no termina en número, retorna -1.
     */
    public int obtenerUltimoDigitoPlaca(String placa) {
        if (placa == null || placa.isBlank()) return -1;
        String limpia = placa.trim().toUpperCase();
        for (int i = limpia.length() - 1; i >= 0; i--) {
            char c = limpia.charAt(i);
            if (c >= '0' && c <= '9') return c - '0';
        }
        return -1;
    }

    /**
     * Mes obligatorio según último dígito (1-12). Lee desde BD (tipo 3 = RTV).
     * -1 si no se puede determinar. Fallback a Art. 12 si no hay datos en BD.
     */
    public int obtenerMesObligatorio(int ultimoDigito) {
        if (ultimoDigito < 0 || ultimoDigito > 9) return -1;
        List<CalendarizacionMatriculacion> lista = calendarizacionRepository
                .findByTipoAndEstadoOrderByUltimoDigitoPlacaAsc(TIPO_RTV, "ACTIVO");
        Map<Integer, Integer> digitoAMes = lista.stream()
                .filter(c -> c.getUltimoDigitoPlaca() != null && c.getMes() != null)
                .collect(Collectors.toMap(CalendarizacionMatriculacion::getUltimoDigitoPlaca,
                        CalendarizacionMatriculacion::getMes, (a, b) -> a));
        return digitoAMes.getOrDefault(ultimoDigito, mesPorDigitoFallback(ultimoDigito));
    }

    /** Fallback Art. 12 si BD vacía: 1→2, 2→3, ..., 9→10, 0→11 */
    private int mesPorDigitoFallback(int d) {
        int[] f = {11, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        return f[d];
    }

    /**
     * Estado de calendarización para la fecha dada.
     * OPORTUNO: en el mes correcto.
     * OPCIONAL: antes del mes (adelantado).
     * CON_RECARGO: después del mes o en diciembre.
     */
    public String evaluarEstado(int mesObligatorio, LocalDate fechaEvaluacion) {
        if (mesObligatorio < 1 || mesObligatorio > 12) return "OPCIONAL";
        int mes = fechaEvaluacion.getMonthValue();
        if (mes == 12) return "CON_RECARGO"; // Diciembre: todos con recargo
        if (mes > mesObligatorio) return "CON_RECARGO"; // Pasó la fecha
        if (mes == mesObligatorio) return "OPORTUNO";
        return "OPCIONAL"; // Antes del mes
    }

    /**
     * Indica si aplica recargo.
     */
    public boolean aplicaRecargo(String estado) {
        return "CON_RECARGO".equals(estado);
    }

    /**
     * Obtiene el monto del recargo desde BD o valor por defecto.
     */
    public BigDecimal obtenerMontoRecargoDesdeConfig() {
        return recargoRepository.findByClaveAndActivo("monto_recargo")
                .map(r -> {
                    try {
                        return new BigDecimal(r.getValor().trim());
                    } catch (Exception e) {
                        return MONTO_RECARGO_DEFAULT;
                    }
                })
                .filter(v -> v.compareTo(BigDecimal.ZERO) >= 0)
                .orElse(MONTO_RECARGO_DEFAULT);
    }

    /**
     * Evalúa calendarización completa para una placa en la fecha dada.
     */
    public ResultadoCalendarizacion evaluar(String placa, LocalDate fecha) {
        int digito = obtenerUltimoDigitoPlaca(placa);
        int mesObl = obtenerMesObligatorio(digito);
        String estado = evaluarEstado(mesObl, fecha);
        BigDecimal recargo = aplicaRecargo(estado) ? obtenerMontoRecargoDesdeConfig() : BigDecimal.ZERO;
        return new ResultadoCalendarizacion(mesObl, estado, recargo, digito);
    }

    public record ResultadoCalendarizacion(
            int mesObligatorio,
            String estado,
            BigDecimal montoRecargo,
            int ultimoDigito
    ) {}
}
