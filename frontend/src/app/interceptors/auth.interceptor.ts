import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  const cloned = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(cloned).pipe(
    catchError((err) => {
      if (err.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('nombre');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('rol');
        localStorage.removeItem('permisos');
        sessionStorage.setItem('authMessage', 'Tu sesión ha sido cerrada. Inicie sesión nuevamente.');
        router.navigate(['/']);
      }
      return throwError(() => err);
    })
  );
};
