import { NAVIGATION, configurationSections } from './navigation';

describe('Configuration navigation', () => {
  const items = NAVIGATION.find(group => group.label === 'Configuración')!.items;

  it('places every existing option in exactly one section without altering permissions', () => {
    const flattened = configurationSections(items).flatMap(section => section.items);
    expect(flattened.length).toBe(items.length);
    expect(new Set(flattened.map(item => item.route)).size).toBe(items.length);
    for (const item of items) expect(flattened).toContain(item);
  });

  it('does not reintroduce entries removed by permission filtering', () => {
    const allowed = items.filter(item => item.permissions.includes('menu_inspeccion_equipos'));
    const sections = configurationSections(allowed);
    expect(sections.length).toBe(1);
    expect(sections[0].label).toBe('Líneas y equipos');
    expect(sections[0].items.map(item => item.label)).toEqual(['Equipos']);
  });

  it('keeps operational vehicle catalogs separate from security settings', () => {
    const sections = configurationSections(items);
    expect(sections.length).toBe(6);
    expect(sections.find(section => section.label === 'Catálogos de vehículos')!.items.length).toBe(12);
    expect(sections.find(section => section.label === 'Usuarios y permisos')!.items.every(item => item.route.includes('/administracion/'))).toBe(true);
  });
});
