import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { InicioComponent } from './paginas/inicio/inicio';
import { AreasComponent } from './paginas/administracion/areas/areas';
import { EmpresaComponent } from './paginas/administracion/empresa/empresa';
import { RolesComponent } from './paginas/administracion/roles/roles';
import { UsuariosComponent } from './paginas/administracion/usuarios/usuarios';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'inicio',
    component: InicioComponent,
    children: [
      { path: 'administracion/usuarios', component: UsuariosComponent },
      { path: 'administracion/roles', component: RolesComponent },
      { path: 'administracion/areas', component: AreasComponent },
      { path: 'administracion/empresa', component: EmpresaComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
