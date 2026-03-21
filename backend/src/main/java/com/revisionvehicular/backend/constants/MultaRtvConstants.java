package com.revisionvehicular.backend.constants;

/**
 * Texto canónico para multas y consultas por no presentación a RTV anual.
 */
public final class MultaRtvConstants {

    private MultaRtvConstants() {}

    /**
     * Filtro de motivo (ambas partes deben aparecer, sin importar el orden).
     * Coincide con {@link #esMotivoMultaRtvAnual(String)}.
     */
    public static final String MOTIVO_FILTRO_CONTIENE_REVISION_TECNICA = "revisión técnica";

    public static final String MOTIVO_FILTRO_CONTIENE_ANUAL = "anual";

    public static final String PAIS_DEFECTO_MULTA = "ecuador";

    public static final String PUNTOS_DEFECTO_MULTA = "0";

    public static boolean esMotivoMultaRtvAnual(String motivo) {
        if (motivo == null || motivo.isBlank()) {
            return false;
        }
        String m = motivo.toLowerCase();
        return m.contains("revisión técnica") && m.contains("anual");
    }
}
