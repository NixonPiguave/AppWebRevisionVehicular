/**
 * Mapeo de métodos de inspección a rutas/componentes.
 * Cada método del catálogo se asocia a la ruta del componente que debe abrirse.
 *
 * La coincidencia se hace por nombre (case-insensitive, busca palabras clave).
 * Ej: "REVISIÓN VISUAL" → registrar (RegistrarInspeccionComponent)
 */
export const METODO_INSPECCION_RUTAS: { palabrasClave: string[]; ruta: string }[] = [
  { palabrasClave: ['visual', 'inspección visual', 'inspeccion visual'], ruta: '/inicio/inspeccion-rtv/registrar' },
  { palabrasClave: ['mecatronica', 'mecatrónica'], ruta: '/inicio/inspeccion-rtv/revision-mecatronica' },
  { palabrasClave: ['gases'], ruta: '/inicio/inspeccion-rtv/revision-gases' },
];

/**
 * Obtiene la ruta asociada a un método de inspección según su nombre.
 * @param nombreMetodo Nombre del método (ej: "REVISIÓN VISUAL", "REVISIÓN MECATRONICA")
 * @returns La ruta o null si no hay coincidencia (se usará la ruta por defecto)
 */
export function obtenerRutaPorMetodo(nombreMetodo: string): string | null {
  const nombre = (nombreMetodo || '').toLowerCase().trim();
  for (const config of METODO_INSPECCION_RUTAS) {
    const coincide = config.palabrasClave.some(palabra =>
      nombre.includes(palabra.toLowerCase())
    );
    if (coincide) {
      return config.ruta;
    }
  }
  return null;
}
