import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';
import { EmpresaService } from '../../services/administracion/empresa.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  usuario = '';
  password = '';
  hidePassword = true;
  error = '';
  /** Mensaje cuando la sesión fue cerrada por admin o por inicio en otro dispositivo. */
  mensajeSesionCerrada = '';

  //  Variables para el logo
  empresaLogo: string | null = null;
  empresaNombre: string = 'Revisión Técnica Vehicular';
  cargandoLogo: boolean = true;


  constructor(
    private authService: AuthService,
    private empresaService: EmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const msg = sessionStorage.getItem('authMessage');
    if (msg) {
      this.mensajeSesionCerrada = msg;
      sessionStorage.removeItem('authMessage');
    }
    this.cargarLogoEmpresa();
  }


    //Cargar logo de la empresa para mostrarlo en el login
  cargarLogoEmpresa(): void {
    this.empresaService.listarEmpresas().subscribe({
      next: (empresas) => {
        if (empresas.length > 0) {
          const empresa = empresas[0];

          // Si tiene logo de Cloudinary, usarlo
          if (empresa.logoempresa && empresa.logoempresa.startsWith('http')) {
            this.empresaLogo = empresa.logoempresa;
            console.log('Logo de empresa cargado:', this.empresaLogo);
          }

          // Usar nombre de la empresa
          if (empresa.nombre) {
            this.empresaNombre = empresa.nombre;
          }
        }

        this.cargandoLogo = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('No se pudo cargar logo de empresa:', err);
        // No es crítico, usar logo por defecto
        this.cargandoLogo = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }


  login() {
    this.error = '';

    const request: LoginRequest = {
      usuario: this.usuario,
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.error = err.error;
        this.cdr.detectChanges();
      }
    });
  }
}
