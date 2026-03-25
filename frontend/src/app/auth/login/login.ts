import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';
import { EmpresaService } from '../../services/administracion/empresa.service';
import { BackupService, EstadoBdRestore } from '../../services/backup/backup.service';

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
  estadoBdRestore: EstadoBdRestore | null = null;
  mostrandoRestore = false;
  archivoRestoreSeleccionado: File | null = null;
  nombreArchivoRestore = '';
  restaurandoBd = false;
  errorRestoreBd = '';
  exitoRestoreBd = '';

  //  Variables para el logo
  empresaLogo: string | null = null;
  empresaNombre: string = 'Revisión Técnica Vehicular';
  cargandoLogo: boolean = true;


  constructor(
    private authService: AuthService,
    private empresaService: EmpresaService,
    private backupService: BackupService,
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
    this.verificarEstadoBdParaRestore();
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

  verificarEstadoBdParaRestore(): void {
    this.backupService.estadoBdRestore().subscribe({
      next: (estado) => {
        this.estadoBdRestore = estado;
        this.mostrandoRestore = !!estado?.requiereRestauracion;
        this.cdr.detectChanges();
      },
      error: () => {
        // Si falla endpoint, no bloqueamos login.
      }
    });
  }

  onSeleccionarArchivoRestore(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files.length > 0 ? input.files[0] : null;
    this.archivoRestoreSeleccionado = file;
    this.nombreArchivoRestore = file?.name ?? '';
    this.errorRestoreBd = '';
    this.exitoRestoreBd = '';
  }

  ejecutarRestoreDesdeLogin(): void {
    if (!this.archivoRestoreSeleccionado) {
      this.errorRestoreBd = 'Seleccione un archivo .backup para restaurar.';
      return;
    }
    if (!this.archivoRestoreSeleccionado.name.toLowerCase().endsWith('.backup')) {
      this.errorRestoreBd = 'El archivo debe tener extensión .backup.';
      return;
    }
    this.restaurandoBd = true;
    this.errorRestoreBd = '';
    this.exitoRestoreBd = '';
    this.backupService.ejecutarRestoreUpload(this.archivoRestoreSeleccionado).subscribe({
      next: (res) => {
        this.exitoRestoreBd = res?.mensaje || 'Restauración completada correctamente.';
        this.restaurandoBd = false;
        this.archivoRestoreSeleccionado = null;
        this.nombreArchivoRestore = '';
        this.verificarEstadoBdParaRestore();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorRestoreBd = err?.error?.message || err?.message || 'No se pudo restaurar la base de datos.';
        this.restaurandoBd = false;
        this.cdr.detectChanges();
      }
    });
  }


  login() {
    if (this.mostrandoRestore) {
      this.error = 'Primero restaure la base de datos para habilitar el inicio de sesión.';
      return;
    }
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
        this.error = typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al iniciar sesión');
        this.cdr.detectChanges();
      }
    });
  }

}
