import { partLabel, tooltipPosition, ZONE_LABELS } from './vehicle-part-info';

describe('Vehicle part tooltip', () => {
  it('uses human names and strips only Blender duplicate suffixes', () => {
    expect(partLabel('Neumático delantero izquierdo.001', 'ruedaDelIzq')).toBe(
      'Neumático delantero izquierdo',
    );
    expect(partLabel('Motor 1.6', 'chasis')).toBe('Motor 1.6');
    expect(partLabel(undefined, 'ruedaTrasera')).toBe('Rueda trasera');
  });

  it('covers car and motorcycle inspection zones', () => {
    expect(Object.keys(ZONE_LABELS)).toHaveLength(13);
    expect(ZONE_LABELS.ruedaDelIzq).toContain('izquierda');
    expect(ZONE_LABELS.chasis).toContain('motor');
  });

  it('keeps the card inside the viewport at each corner', () => {
    for (const [width, height] of [
      [940, 460],
      [300, 380],
    ]) {
      for (const [x, y] of [
        [0, 0],
        [width, 0],
        [0, height],
        [width, height],
      ]) {
        const pos = tooltipPosition(x, y, width, height);
        expect(pos.x).toBeGreaterThanOrEqual(12);
        expect(pos.y).toBeGreaterThanOrEqual(12);
        expect(pos.x + Math.min(248, width - 24)).toBeLessThanOrEqual(width - 12);
        expect(pos.y + 120).toBeLessThanOrEqual(height - 12);
      }
    }
  });
});
