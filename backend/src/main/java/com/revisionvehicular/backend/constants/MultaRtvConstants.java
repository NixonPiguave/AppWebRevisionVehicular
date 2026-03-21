package com.revisionvehicular.backend.constants;

import java.util.Locale;

/**
 * Textos y filtros alineados con las consultas JPQL de multas por no presentación a RTV anual.
 */
public final class MultaRtvConstants {

    public static final String PAIS_DEFECTO_MULTA = "Ecuador";
    public static final String PUNTOS_DEFECTO_MULTA = "0";

    /** Subcadena del motivo (uso en LIKE %...%). Debe coincidir con {@link #esMotivoMultaRtvAnual(String)}. */
    public static final String MOTIVO_FILTRO_REVISION_TECNICA = "revisión técnica";

    public static final String MOTIVO_FILTRO_ANUAL = "anual";

    private MultaRtvConstants() {
    }

    public static boolean esMotivoMultaRtvAnual(String motivo) {
        if (motivo == null || motivo.isBlank()) {
            return false;
        }
        String m = motivo.toLowerCase(Locale.ROOT);
        return m.contains(MOTIVO_FILTRO_REVISION_TECNICA.toLowerCase(Locale.ROOT))
                && m.contains(MOTIVO_FILTRO_ANUAL.toLowerCase(Locale.ROOT));
    }
}
