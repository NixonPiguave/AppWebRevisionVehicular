import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { InicioComponent } from './paginas/inicio/inicio';
import { AreasComponent } from './paginas/administracion/areas/areas';
import { EmpresaComponent } from './paginas/administracion/empresa/empresa';
import { RolesComponent } from './paginas/administracion/roles/roles';
import { UsuariosComponent } from './paginas/administracion/usuarios/usuarios';
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
import { Equipos } from './paginas/inspeccion_rtv/equipos/equipos';
import {LineasInspeccionComponent} from './paginas/inspeccion_rtv/lineas-inspeccion/lineas-inspeccion';
import {UnidadMedidaComponent} from './paginas/configuracion_umbral/unidades-medida/unidades-medida';
import {TipoVehiculoComponent} from './paginas/catalogos_vehiculos/tipo-vehiculo/tipo-vehiculo';
import {
  CalendarizacionMatriculacionComponent
} from './paginas/ant/calendarizacion-matriculacion/calendarizacion-matriculacion';
import {PropietarioComponent} from './paginas/gestion_vehicular/propietario/propietario';
import {UmbralComponent} from './paginas/configuracion_umbral/umbral/umbral';


export const routes: Routes = [
  { path: '', component: InicioComponent },
  {
    path: 'inicio',
    component: InicioComponent,
    children: [
      // ADMINISTRACIÓN
      { path: 'administracion/usuarios', component: UsuariosComponent },
      { path: 'administracion/roles', component: RolesComponent },
      { path: 'administracion/areas', component: AreasComponent },
      { path: 'administracion/empresa', component: EmpresaComponent },

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

      //INSPECION_RTV
      { path: 'inspeccion-rtv/metodo-inspeccion', component: MetodoInspeccionComponent },
      { path: 'inspeccion-rtv/equipos', component: Equipos },
      { path: 'inspeccion-rtv/lineas-inspeccion', component: LineasInspeccionComponent },

      //Configuracion de Unidades de Medida
      { path: 'configuracion-umbral/unidades-medida', component: UnidadMedidaComponent },
      { path: 'configuracion-umbral/umbral', component: UmbralComponent },
      //Gestion vehicular
      { path: 'gestion_vehicular/propietario', component: PropietarioComponent },

      //ANT
      { path: 'ant/Calendarizacion-Matriculacion', component: CalendarizacionMatriculacionComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
