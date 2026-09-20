import type { VehicleZone } from './vehicle-inspection-3d';

export const ZONE_LABELS: Record<VehicleZone, string> = {
  delantera: 'Zona delantera',
  trasera: 'Zona trasera',
  lateralIzquierdo: 'Lateral izquierdo',
  lateralDerecho: 'Lateral derecho',
  ruedaDelIzq: 'Rueda delantera izquierda',
  ruedaDelDer: 'Rueda delantera derecha',
  ruedaTraIzq: 'Rueda trasera izquierda',
  ruedaTraDer: 'Rueda trasera derecha',
  habitaculo: 'Carrocería y habitáculo',
  parteInferior: 'Parte inferior',
  ruedaDelantera: 'Rueda delantera',
  ruedaTrasera: 'Rueda trasera',
  chasis: 'Chasis y motor',
};

/** Blender appends .001 to duplicate names; those identifiers are not UI labels. */
export function partLabel(label: unknown, zone: VehicleZone): string {
  return typeof label === 'string' && label.trim()
    ? label
        .replace(/\.\d{3,}$/, '')
        .trim()
        .slice(0, 90)
    : ZONE_LABELS[zone];
}

export function tooltipPosition(x: number, y: number, width: number, height: number) {
  const cardWidth = Math.min(248, Math.max(0, width - 24));
  const left = x + 18 + cardWidth < width - 12 ? x + 18 : x - cardWidth - 18;
  const top = y + 18 + 120 < height - 12 ? y + 18 : y - 138;
  return {
    x: Math.max(12, Math.min(left, width - cardWidth - 12)),
    y: Math.max(12, Math.min(top, height - 132)),
  };
}
