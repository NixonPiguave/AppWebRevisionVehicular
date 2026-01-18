import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { InicioComponent } from './paginas/inicio/inicio';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: '**', redirectTo: '' }
];
