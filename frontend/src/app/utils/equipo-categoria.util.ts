/**
 * Utilidades para categorizar equipos entre GASES y MECATRÓNICA.
 * Equipos de gases: analizador, opacímetro, tubo de gases, etc.
 */
export function esEquipoGases(nombreEquipo: string): boolean {
  if (!nombreEquipo || typeof nombreEquipo !== 'string') return false;
  const n = nombreEquipo.toUpperCase().normalize('NFD').replace(/\u0300/g, '');
  return (
    n.includes('GASES') ||
    n.includes('OPACIMETRO') ||
    n.includes('OPACÍMETRO') ||
    n.includes('ANALIZADOR') ||
    n.includes('TUBO')
  );
}

/** Equipo para gasolina/motos: analizador de gases, totem, tubo (CO, HC, Lambda) */
export function esEquipoAnalizadorGases(nombreEquipo: string): boolean {
  if (!nombreEquipo || typeof nombreEquipo !== 'string') return false;
  const n = nombreEquipo.toUpperCase().normalize('NFD').replace(/\u0300/g, '');
  return n.includes('GASES') || n.includes('ANALIZADOR') || n.includes('TUBO') || n.includes('TOTEM');
}

/** Equipo para diesel: opacímetro */
export function esEquipoOpacimetro(nombreEquipo: string): boolean {
  if (!nombreEquipo || typeof nombreEquipo !== 'string') return false;
  const n = nombreEquipo.toUpperCase().normalize('NFD').replace(/\u0300/g, '');
  return n.includes('OPACIMETRO') || n.includes('OPACÍMETRO');
}

export function esEquipoMecatronica(nombreEquipo: string): boolean {
  return !esEquipoGases(nombreEquipo);
}

/** Parámetros que un equipo de mecatrónica puede influir */
export type ParametrosMecatronica = 'frenos' | 'suspension' | 'alineacion';

/**
 * Determina qué parámetros de mecatrónica influye un equipo por su nombre.
 */
export function parametrosQueInfluenciaEquipo(nombreEquipo: string): ParametrosMecatronica[] {
  if (!nombreEquipo || typeof nombreEquipo !== 'string') return [];
  const n = nombreEquipo.toUpperCase().normalize('NFD').replace(/\u0300/g, '');
  const params: ParametrosMecatronica[] = [];
  if (n.includes('FRENO')) params.push('frenos');
  if (n.includes('SUSPENSION') || n.includes('SUSPENSIÓN') || n.includes('AMORTIGUADOR')) params.push('suspension');
  if (n.includes('ALINEADOR') || n.includes('ALINEACION') || n.includes('ALINEACIÓN')) params.push('alineacion');
  return params;
}

/** Genera valores aleatorios para parámetros de mecatrónica (simula lectura de máquina) */
export function generarValoresAleatoriosMecatronica(params: ParametrosMecatronica[]): {
  frenosEficacia?: number;
  frenosDesequilibrio?: number;
  suspensionEficacia?: number;
  suspensionDesequilibrio?: number;
  alineacionConvergencia?: number;
  alineacionDivergencia?: number;
} {
  const r = (min: number, max: number, decimals = 1) =>
    Number((min + Math.random() * (max - min)).toFixed(decimals));
  const result: {
    frenosEficacia?: number;
    frenosDesequilibrio?: number;
    suspensionEficacia?: number;
    suspensionDesequilibrio?: number;
    alineacionConvergencia?: number;
    alineacionDivergencia?: number;
  } = {};
  if (params.includes('frenos')) {
    result.frenosEficacia = r(55, 98);
    result.frenosDesequilibrio = r(0, 8);
  }
  if (params.includes('suspension')) {
    result.suspensionEficacia = r(60, 98);
    result.suspensionDesequilibrio = r(0, 6);
  }
  if (params.includes('alineacion')) {
    result.alineacionConvergencia = r(-1.5, 1.5);
    result.alineacionDivergencia = r(-1.5, 1.5);
  }
  return result;
}
