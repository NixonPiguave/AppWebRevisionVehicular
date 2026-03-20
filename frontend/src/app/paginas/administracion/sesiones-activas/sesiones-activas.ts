import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SesionesUsuariosService, SesionUsuarioDTO } from '../../../services/administracion/sesiones-usuarios.service';

const INTERVALO_ACTUALIZACION_MS = 10000; // 10 segundos

@Component({
  selector: 'app-sesiones-activas',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sesiones-activas.html',
  styleUrl: './sesiones-activas.css'
})
export class SesionesActivasComponent implements OnInit, OnDestroy {

  sesiones: SesionUsuarioDTO[] = [];
  cargando = false;
  cerrandoId: number | null = null;
  error = '';
  private refreshSubscription: Subscription | null = null;

  constructor(
    private sesionesService: SesionesUsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
    // Actualizar la lista automáticamente cada 10 segundos
    this.refreshSubscription = interval(INTERVALO_ACTUALIZACION_MS).pipe(
      switchMap(() => this.sesionesService.listarActivas())
    ).subscribe({
      next: (data) => {
        if (!this.cargando && this.cerrandoId == null) {
          this.sesiones = data ?? [];
          this.cdr.detectChanges();
        }
      },
      error: () => { /* ignorar errores del refresh en background */ }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.refreshSubscription = null;
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.sesionesService.listarActivas().subscribe({
      next: (data) => {
        this.sesiones = data ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.sesiones = [];
        this.cargando = false;
        this.error = 'Error al cargar sesiones activas.';
        this.cdr.detectChanges();
      }
    });
  }

  desconectar(s: SesionUsuarioDTO): void {
    if (this.cerrandoId != null) return;
    this.cerrandoId = s.sesionId;
    this.sesionesService.cerrarSesion(s.sesionId).subscribe({
      next: () => {
        this.sesiones = this.sesiones.filter(x => x.sesionId !== s.sesionId);
        this.cerrandoId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cerrandoId = null;
        this.error = 'Error al desconectar.';
        this.cdr.detectChanges();
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}
