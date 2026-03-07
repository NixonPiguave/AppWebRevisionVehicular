import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';

const RUTAS_TRAMITE: { [servicioId: number]: string } = {
  9:  '/inicio/gestion_vehicular/bloqueo-vehiculo',
  10: '/inicio/gestion_vehicular/desbloqueo-vehiculo',
  12: '/inicio/gestion_vehicular/baja-vehiculo',
};

const NOMBRES_SERVICIO: { [id: number]: string } = {
  1:  'Emisión de matrícula por Primera Vez',
  2:  'Emisión de Documento Anual de Circulación',
  3:  'Duplicado de Documento de Matrícula',
  4:  'Duplicado del Documento Anual de Circulación',
  5:  'Transferencia de Dominio',
  6:  'Cambio de Servicio',
  7:  'Matriculación de Unidades de Carga',
  8:  'Cambio de Características',
  9:  'Bloqueo de Vehículo',
  10: 'Desbloqueo de Vehículo',
  11: 'Registro de Observaciones',
  12: 'Baja de Vehículos',
  13: 'Registro de Incidentes',
  14: 'Anulación de Trámites',
  15: 'Registro en Base Única Nacional',
  16: 'Casos Especiales',
};

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './recepcion.html',
  styleUrl: './recepcion.css'
})
export class RecepcionComponent implements OnInit {

  turnos: Turnos[] = [];
  filtrados: Turnos[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  // Modal de confirmación
  mostrarModalConfirmacion = false;
  turnoAAtender: Turnos | null = null;
  confirmando = false;
  errorConfirmacion = '';

  constructor(
    private turnosService: TurnosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.turnosService.getAll().subscribe({
      next: (data) => {
        // Solo turnos con monto pagado y en estado GENERADO o CONFIRMADO
        this.turnos = (data ?? []).filter(t =>
          t.montoPagado != null &&
          (t.estado === 'GENERADO' || t.estado === 'CONFIRMADO')
        );
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los turnos de recepción.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    const f = (this.filtro || '').toLowerCase().trim();
    this.filtrados = !f ? [...this.turnos] : this.turnos.filter(t =>
      (t.turnoId?.toString() || '').includes(f) ||
      (t.propietarioId?.toString() || '').includes(f) ||
      (t.vehiculoId?.toString() || '').includes(f) ||
      (this.getNombreServicio(t.servicioId).toLowerCase()).includes(f) ||
      (t.estado?.toLowerCase() || '').includes(f)
    );
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  get paginados(): Turnos[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }

  getNombreServicio(servicioId?: number): string {
    if (!servicioId) return '-';
    return NOMBRES_SERVICIO[servicioId] || `Servicio #${servicioId}`;
  }

  tramiteDisponible(servicioId?: number): boolean {
    return servicioId != null && servicioId in RUTAS_TRAMITE;
  }

  getIconoServicio(servicioId?: number): string {
    const iconos: { [id: number]: string } = { 9: 'lock', 10: 'lock_open', 12: 'remove_circle' };
    return servicioId && iconos[servicioId] ? iconos[servicioId] : 'assignment';
  }

  getEstadoBadgeClass(estado?: string): string {
    switch (estado?.toUpperCase()) {
      case 'GENERADO':   return 'badge-generado';
      case 'CONFIRMADO': return 'badge-confirmado';
      case 'ATENDIDO':   return 'badge-atendido';
      case 'CANCELADO':  return 'badge-cancelado';
      default:           return '';
    }
  }

  // =============================================
  // MODAL DE CONFIRMACIÓN
  // =============================================
  abrirConfirmacion(turno: Turnos): void {
    if (!this.tramiteDisponible(turno.servicioId)) return;
    this.turnoAAtender = turno;
    this.errorConfirmacion = '';
    this.mostrarModalConfirmacion = true;
    this.cdr.detectChanges();
  }

  cerrarConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.turnoAAtender = null;
    this.errorConfirmacion = '';
    this.confirmando = false;
  }

  confirmarAtencion(): void {
    if (!this.turnoAAtender?.turnoId) return;

    this.confirmando = true;
    this.errorConfirmacion = '';

    // 1. Cambiar estado a CONFIRMADO
    this.turnosService.cambiarEstado(this.turnoAAtender.turnoId, 'CONFIRMADO').subscribe({
      next: () => {
        const turno = this.turnoAAtender!;
        this.cerrarConfirmacion();

        // 2. Navegar al formulario del trámite con los datos del turno
        const ruta = RUTAS_TRAMITE[turno.servicioId!];
        this.router.navigate([ruta], {
          queryParams: {
            turnoId:      turno.turnoId,
            vehiculoId:   turno.vehiculoId,
            propietarioId: turno.propietarioId
          }
        });
      },
      error: () => {
        this.confirmando = false;
        this.errorConfirmacion = 'Error al actualizar el estado del turno. Intente nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }
}
