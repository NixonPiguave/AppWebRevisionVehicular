import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { InicioComponent } from './paginas/inicio/inicio';
import { AreasComponent } from './paginas/administracion/areas/areas';
import { EmpresaComponent } from './paginas/administracion/empresa/empresa';
import { RolesComponent } from './paginas/administracion/roles/roles';
import { UsuariosComponent } from './paginas/administracion/usuarios/usuarios';
import { TurnosComponent } from './paginas/administracion/turnos/turnos';
import { AmbitoOperacionalComponent } from './paginas/catalogos_vehiculos/ambito-operacional/ambito-operacional';
import { CapacidadCargaComponent } from './paginas/catalogos_vehiculos/capacidad-carga/capacidad-carga';
import {CategoriasComponent} from './paginas/catalogos_vehiculos/categorias/categorias';
import {ClasesComponent} from './paginas/catalogos_vehiculos/clases/clases';
import {EjesComponent} from './paginas/catalogos_vehiculos/ejes/ejes';
import {MarcaVehiculoComponent} from './paginas/catalogos_vehiculos/marcas/marcas';
import {ModelosComponent} from './paginas/catalogos_vehiculos/modelos/modelos';
import {TipoCombustibleComponent} from './paginas/catalogos_vehiculos/tipo-combustible/tipo-combustible';
import {TipoMatriculaComponent} from './paginas/catalogos_vehiculos/tipo-matricula/tipo-matricula';
import {TraccionComponent} from './paginas/catalogos_vehiculos/traccion/traccion';
import {SubcategoriasComponent} from './paginas/catalogos_vehiculos/subcategorias/subcategorias';
// Importaciones de Defectos Inspección
import { SubfamiliaDefectoComponent } from './paginas/defectos_inspeccion/subfamilia-defecto/subfamilia-defecto';
import { TiposDefectosComponent } from './paginas/defectos_inspeccion/tipos-defectos/tipos-defectos';
import { CategoriaDefectoComponent } from './paginas/defectos_inspeccion/categoria-defecto/categoria-defecto';
import { FamiliaComponent } from './paginas/defectos_inspeccion/familia-defecto/familia-defecto';

// Importaciones de Inspección RTV
import { MetodoInspeccionComponent } from './paginas/inspeccion_rtv/metodo-inspeccion/metodo-inspeccion';
import { TurnosPagadosComponent } from './paginas/inspeccion_rtv/turnos-pagados/turnos-pagados';
import { RegistrarInspeccionComponent } from './paginas/inspeccion_rtv/registrar-inspeccion/registrar-inspeccion';
import { RevisionMecatronica } from './paginas/inspeccion_rtv/revision-mecatronica/revision-mecatronica';
import { RevisionGases } from './paginas/inspeccion_rtv/revision-gases/revision-gases';
import { Equipos } from './paginas/inspeccion_rtv/equipos/equipos';
import {LineasInspeccionComponent} from './paginas/inspeccion_rtv/lineas-inspeccion/lineas-inspeccion';
import {UnidadMedidaComponent} from './paginas/configuracion_umbral/unidades-medida/unidades-medida';
import {TipoVehiculoComponent} from './paginas/catalogos_vehiculos/tipo-vehiculo/tipo-vehiculo';
import {
  CalendarizacionMatriculacionComponent
} from './paginas/ant/calendarizacion-matriculacion/calendarizacion-matriculacion';
import {PropietarioComponent} from './paginas/gestion_vehicular/propietario/propietario';
import {UmbralComponent} from './paginas/configuracion_umbral/umbral/umbral';
import {DescripcionUmbralComponent} from './paginas/configuracion_umbral/descripcion-umbral/descripcion-umbral';
import {VehiculoComponent} from './paginas/gestion_vehicular/vehiculos/vehiculos';
import {DefectosComponent} from './paginas/defectos_inspeccion/defectos/defectos';
import { BloqueoVehiculoComponent } from './paginas/gestion_vehicular/bloqueo-vehiculo/bloqueo-vehiculo';
import { DesbloqueoVehiculoComponent } from './paginas/gestion_vehicular/desbloqueo-vehiculo/desbloqueo-vehiculo';
import { BajaVehiculoComponent } from './paginas/gestion_vehicular/baja-vehiculo/baja-vehiculo';
import { PagosComponent } from './paginas/operaciones/pagos/pagos';
import { RecepcionComponent } from './paginas/administracion/recepcion/recepcion';
import { AuditoriaComponent } from './paginas/administracion/auditoria/auditoria';
import { AccesosRolComponent } from './paginas/administracion/accesos-rol/accesos-rol';
import { DashboardComponent } from './paginas/inicio/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'inicio',
    component: InicioComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // ADMINISTRACIÓN
      { path: 'administracion/usuarios', component: UsuariosComponent },
      { path: 'administracion/roles', component: RolesComponent },
      { path: 'administracion/areas', component: AreasComponent },
      { path: 'administracion/empresa', component: EmpresaComponent },
      { path: 'administracion/auditoria', component: AuditoriaComponent },
      { path: 'administracion/accesos-rol', component: AccesosRolComponent },

      // CATÁLOGO DE VEHÍCULOS
      { path: 'catalogo-vehiculos/ambito-operacional', component: AmbitoOperacionalComponent },
      { path: 'catalogo-vehiculos/capacidad-carga', component: CapacidadCargaComponent },
      { path: 'catalogo-vehiculos/categorias', component: CategoriasComponent},
      { path: 'catalogo-vehiculos/clases', component: ClasesComponent},
      { path: 'catalogo-vehiculos/ejes', component: EjesComponent},
      { path: 'catalogo-vehiculos/marcas', component: MarcaVehiculoComponent},
      { path: 'catalogo-vehiculos/modelos', component: ModelosComponent},
      { path: 'catalogo-vehiculos/subcategorias', component: SubcategoriasComponent},
      { path: 'catalogo-vehiculos/tipo-combustible', component: TipoCombustibleComponent},
      { path: 'catalogo-vehiculos/tipo-matricula', component: TipoMatriculaComponent},
      { path: 'catalogo-vehiculos/tipo-vehiculo', component: TipoVehiculoComponent},
      { path: 'catalogo-vehiculos/traccion', component: TraccionComponent},

      // DEFECTOS INSPECCIÓN
      { path: 'defectos-inspeccion/tipos-defectos', component: TiposDefectosComponent },
      { path: 'defectos-inspeccion/subfamilia-defecto', component: SubfamiliaDefectoComponent },
      { path: 'defectos-inspeccion/categoria-defecto', component: CategoriaDefectoComponent },
      { path: 'defectos-inspeccion/familia-defecto', component: FamiliaComponent },
      { path: 'defectos-inspeccion/defectos', component: DefectosComponent},

      // INSPECCION_RTV
      { path: 'inspeccion-rtv/metodo-inspeccion', component: MetodoInspeccionComponent },
      { path: 'inspeccion-rtv/turnos-pagados', component: TurnosPagadosComponent },
      { path: 'inspeccion-rtv/registrar', component: RegistrarInspeccionComponent },
      { path: 'inspeccion-rtv/revision-mecatronica', component: RevisionMecatronica },
      { path: 'inspeccion-rtv/revision-gases', component: RevisionGases },
      { path: 'inspeccion-rtv/equipos', component: Equipos },
      { path: 'inspeccion-rtv/lineas-inspeccion', component: LineasInspeccionComponent },

      // CONFIGURACION UMBRAL
      { path: 'configuracion-umbral/unidades-medida', component: UnidadMedidaComponent },
      { path: 'configuracion-umbral/descripcion-umbral', component: DescripcionUmbralComponent },
      { path: 'configuracion-umbral/umbral', component: UmbralComponent },

      // GESTIÓN VEHICULAR
      { path: 'gestion_vehicular/propietario', component: PropietarioComponent },
      { path: 'gestion_vehicular/vehiculo', component: VehiculoComponent },
      { path: 'gestion_vehicular/bloqueo-vehiculo', component: BloqueoVehiculoComponent },
      { path: 'gestion_vehicular/desbloqueo-vehiculo', component: DesbloqueoVehiculoComponent },
      { path: 'gestion_vehicular/baja-vehiculo', component: BajaVehiculoComponent },

      // ANT
      { path: 'ant/Calendarizacion-Matriculacion', component: CalendarizacionMatriculacionComponent },

      // ADMINISTRACIÓN - TURNOS
      { path: 'administracion/turnos', component: TurnosComponent },

      // OPERACIONES
      { path: 'operaciones/pagos', component: PagosComponent },
      { path: 'operaciones/recepcion', component: RecepcionComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
