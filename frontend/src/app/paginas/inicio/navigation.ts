export interface NavigationItem {
  label: string;
  route: string;
  permissions: string[];
  parentPermission?: string;
}
export interface NavigationGroup {
  label: string;
  icon: string;
  items: NavigationItem[];
}
export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

/** One place for configuration taxonomy; routes and permission keys remain unchanged. */
export function configurationSection(item: NavigationItem): string {
  if (item.route.includes('/catalogo-vehiculos/')) return 'Catálogos de vehículos';
  if (item.route.includes('/inspeccion-rtv/')) return 'Líneas y equipos';
  if (item.route.includes('/defectos-inspeccion/')) return 'Defectos';
  if (item.route.includes('/configuracion-umbral/')) return 'Umbrales y criterios';
  if (/\/(usuarios|roles|roles-postgres|accesos-rol|sesiones-activas)$/.test(item.route))
    return 'Usuarios y permisos';
  return 'Organización y mantenimiento';
}

export function configurationSections(items: NavigationItem[]): NavigationSection[] {
  const sections = new Map<string, NavigationItem[]>();
  for (const item of items) {
    const label = configurationSection(item);
    sections.set(label, [...(sections.get(label) ?? []), item]);
  }
  return [...sections].map(([label, items]) => ({ label, items }));
}

export const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Inicio',
    icon: 'space_dashboard',
    items: [
      {
        route: '/inicio/dashboard',
        permissions: ['menu_dashboard'],
        label: 'Resumen operativo',
      },
    ],
  },
  {
    label: 'Recepción',
    icon: 'confirmation_number',
    items: [
      {
        route: '/inicio/administracion/turnos',
        permissions: ['menu_registro_tramite'],
        label: 'Turnos y registro de trámite',
      },
      {
        route: '/inicio/operaciones/pagos',
        permissions: ['menu_pagos'],
        label: 'Pagos',
      },
      {
        route: '/inicio/operaciones/recepcion',
        permissions: ['menu_recepcion'],
        label: 'Recepción',
      },
      {
        route: '/inicio/operaciones/historial-turnos',
        permissions: ['menu_historial_turnos'],
        label: 'Historial de Turnos',
      },
    ],
  },
  {
    label: 'Inspecciones',
    icon: 'fact_check',
    items: [
      {
        route: '/inicio/inspeccion-rtv/turnos-pagados',
        permissions: ['menu_inspeccion_turnos_pagados'],
        label: 'Centro de inspecciones',
      },
    ],
  },
  {
    label: 'Vehículos',
    icon: 'directions_car',
    items: [
      {
        route: '/inicio/gestion_vehicular/vehiculo',
        permissions: ['menu_vehiculos'],
        label: 'Vehículos',
      },
      {
        route: '/inicio/gestion_vehicular/propietario',
        permissions: ['menu_propietario'],
        label: 'Propietario',
      },
      {
        route: '/inicio/gestion_vehicular/improntas',
        permissions: ['menu_improntas'],
        label: 'Improntas',
      },
    ],
  },
  {
    label: 'Trámites',
    icon: 'description',
    items: [
      {
        route: '/inicio/gestion_vehicular/transferencia-dominio',
        permissions: ['menu_transferencia_dominio'],
        label: 'Transferencia de dominio',
      },
      {
        route: '/inicio/ant/Calendarizacion-Matriculacion',
        permissions: [],
        label: 'Calendarización Matriculación',
        parentPermission: 'menu_ant',
      },
      {
        route: '/inicio/ant/solicitudes-placas',
        permissions: ['menu_solicitudes_placas'],
        label: 'Solicitudes de placas',
        parentPermission: 'menu_ant',
      },
      {
        label: 'Bloqueo',
        route: '/inicio/gestion_vehicular/bloqueo-vehiculo',
        permissions: ['menu_bloqueo'],
      },
      {
        label: 'Desbloqueo',
        route: '/inicio/gestion_vehicular/desbloqueo-vehiculo',
        permissions: ['menu_desbloqueo'],
      },
      {
        label: 'Baja del vehículo',
        route: '/inicio/gestion_vehicular/baja-vehiculo',
        permissions: ['menu_baja'],
      },
    ],
  },
  {
    label: 'Configuración',
    icon: 'settings',
    items: [
      {
        route: '/inicio/catalogo-vehiculos/marcas',
        permissions: ['menu_catalogo_marcas'],
        label: 'Marcas',
      },
      {
        route: '/inicio/catalogo-vehiculos/modelos',
        permissions: ['menu_catalogo_modelos'],
        label: 'Modelos',
      },
      {
        route: '/inicio/catalogo-vehiculos/tipo-vehiculo',
        permissions: ['menu_catalogo_tipo_vehiculo'],
        label: 'Tipos de Vehículo',
      },
      {
        route: '/inicio/catalogo-vehiculos/clases',
        permissions: ['menu_catalogo_clases'],
        label: 'Clases',
      },
      {
        route: '/inicio/catalogo-vehiculos/categorias',
        permissions: ['menu_catalogo_categorias'],
        label: 'Categorías',
      },
      {
        route: '/inicio/catalogo-vehiculos/subcategorias',
        permissions: ['menu_catalogo_subcategorias'],
        label: 'Subcategorías',
      },
      {
        route: '/inicio/catalogo-vehiculos/tipo-combustible',
        permissions: ['menu_catalogo_tipo_combustible'],
        label: 'Tipos de Combustible',
      },
      {
        route: '/inicio/catalogo-vehiculos/tipo-matricula',
        permissions: ['menu_catalogo_tipo_matricula'],
        label: 'Tipos de Matrícula',
      },
      {
        route: '/inicio/catalogo-vehiculos/traccion',
        permissions: ['menu_catalogo_traccion'],
        label: 'Tracción',
      },
      {
        route: '/inicio/catalogo-vehiculos/ejes',
        permissions: ['menu_catalogo_ejes'],
        label: 'Ejes',
      },
      {
        route: '/inicio/catalogo-vehiculos/capacidad-carga',
        permissions: ['menu_catalogo_capacidad'],
        label: 'Capacidad de Carga',
      },
      {
        route: '/inicio/catalogo-vehiculos/ambito-operacional',
        permissions: ['menu_catalogo_ambito'],
        label: 'Ámbito Operacional',
      },
      {
        route: '/inicio/inspeccion-rtv/lineas-inspeccion',
        permissions: ['menu_inspeccion_lineas'],
        label: 'Líneas de Inspección',
      },
      {
        route: '/inicio/inspeccion-rtv/metodo-inspeccion',
        permissions: ['menu_inspeccion_metodos'],
        label: 'Métodos de Inspección',
      },
      {
        route: '/inicio/inspeccion-rtv/equipos',
        permissions: ['menu_inspeccion_equipos'],
        label: 'Equipos',
      },
      {
        route: '/inicio/defectos-inspeccion/familia-defecto',
        permissions: ['menu_defectos_familia'],
        label: 'Familias de Defectos',
      },
      {
        route: '/inicio/defectos-inspeccion/subfamilia-defecto',
        permissions: ['menu_defectos_subfamilia'],
        label: 'Subfamilias de Defectos',
      },
      {
        route: '/inicio/defectos-inspeccion/categoria-defecto',
        permissions: ['menu_defectos_categoria'],
        label: 'Categorías de Defectos',
      },
      {
        route: '/inicio/defectos-inspeccion/tipos-defectos',
        permissions: ['menu_defectos_tipos'],
        label: 'Tipos de Defectos',
      },
      {
        route: '/inicio/defectos-inspeccion/defectos',
        permissions: ['menu_defectos'],
        label: 'Defectos',
      },
      {
        route: '/inicio/configuracion-umbral/unidades-medida',
        permissions: ['menu_umbral_unidades'],
        label: 'Unidades de Medida',
      },
      {
        route: '/inicio/configuracion-umbral/descripcion-umbral',
        permissions: ['menu_umbral_descripcion'],
        label: 'Descripción de Umbral',
      },
      {
        route: '/inicio/configuracion-umbral/umbral',
        permissions: ['menu_umbral'],
        label: 'Umbral',
      },
      {
        route: '/inicio/configuracion-umbral/criterio-resultado',
        permissions: ['menu_criterio_resultado'],
        label: 'Criterios Aprobación',
      },
      {
        route: '/inicio/administracion/usuarios',
        permissions: ['menu_usuarios'],
        label: 'Usuarios',
      },
      {
        route: '/inicio/administracion/roles',
        permissions: ['menu_roles'],
        label: 'Roles',
      },
      {
        route: '/inicio/administracion/roles-postgres',
        permissions: ['menu_roles_postgres', 'menu_roles'],
        label: 'Roles PostgreSQL',
      },
      {
        route: '/inicio/administracion/areas',
        permissions: ['menu_areas'],
        label: 'Áreas',
      },
      {
        route: '/inicio/administracion/empresa',
        permissions: ['menu_empresa'],
        label: 'Empresa',
      },
      {
        route: '/inicio/administracion/auditoria',
        permissions: ['menu_auditoria'],
        label: 'Auditoría',
      },
      {
        route: '/inicio/administracion/accesos-rol',
        permissions: ['menu_accesos_rol'],
        label: 'Accesos por rol',
      },
      {
        route: '/inicio/administracion/sesiones-activas',
        permissions: ['menu_sesiones_activas'],
        label: 'Sesiones activas',
      },
      {
        route: '/inicio/backup/manager',
        permissions: ['menu_backup'],
        label: 'Respaldos',
      },
    ],
  },
];
