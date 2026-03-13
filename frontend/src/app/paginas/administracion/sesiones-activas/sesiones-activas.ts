import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SesionesUsuariosService, SesionUsuarioDTO } from '../../../services/administracion/sesiones-usuarios.service';

@Component({
  selector: 'app-sesiones-activas',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sesiones-activas.html',
  styleUrl: './sesiones-activas.css'
})
export class SesionesActivasComponent implements OnInit {

  sesiones: SesionUsuarioDTO[] = [];
  cargando = false;
  cerrandoId: number | null = null;
  error = '';

  constructor(
    private sesionesService: SesionesUsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
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
