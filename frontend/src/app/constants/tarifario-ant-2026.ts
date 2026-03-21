/**
 * Referencia de valores ANT Ecuador 2026 (tarifario general).
 * El PDF oficial es imagen; estos importes coinciden con tablas publicadas en medios
 * (p. ej. ecuadorec.com, eldiario.ec, marzo 2026). Verifique siempre contra el documento
 * "CUADRO TARIFARIO DE VALORES 2026" de la ANT.
 */
export const TARIFARIO_ANT_2026_REFERENCIA = {
  vigenciaDesde: '2026-03-09',
  revisionTecnicaVehicular: {
    /** Motocicletas y plataformas (típico categoría L) */
    motosPlataformasUsd: 15.86,
    /** Taxis, busetas, furgonetas */
    taxisBusFurgonUsd: 18.19,
    /** Vehículos livianos particulares */
    livianosUsd: 26.58,
  },
  tramitesFrecuentes: {
    licenciaNoProfesionalPrimeraRenovacionAB: 68,
    licenciaProfesionalPrimeraRenovacion: 110,
    duplicadoLicencia: 26,
    bloqueoDesbloqueoVehiculo: 7.5,
    tasaMatriculaParticulares: 36,
    tasaMatriculaMotos: 31,
  },
} as const;
