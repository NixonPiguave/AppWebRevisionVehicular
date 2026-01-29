import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { InicioComponent } from './paginas/inicio/inicio';
import {AreasComponent} from './paginas/administracion/areas/areas';
import {EmpresaComponent} from './paginas/administracion/empresa/empresa';
import {RolesComponent} from './paginas/administracion/roles/roles';
import {UsuariosComponent} from './paginas/administracion/usuarios/usuarios';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: '**', redirectTo: '' }
];
