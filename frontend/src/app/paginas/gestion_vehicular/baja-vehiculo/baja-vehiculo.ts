import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BajaVehiculoService, BajaVehiculo } from '../../../services/rtv/BajaVehiculo.service';

const BAJA_VACIA: BajaVehiculo = {
  idBaja: null,
  tramiteId: null,
  vehiculoId: null,
  propietarioId: null,
  entidadId: null,
  usuarioId: null,
  numeroTramite: '',
  motivoBaja: 'VIDA_UTIL',
  descripcionMotivo: '',
  inspeccion1Id: null,
  inspeccion2Id: null,
  inspeccion3Id: null,
  empresaChatarrizado: '',
  certChatarrizado: '',
  fechaChatarrizado: '',
  ordenJudicial: '',
  constanciaPolicial: '',
  notificadoSri: 'NO',
  fechaNotificacionSri: '',
  estado: 'CONCLUIDO',
  fechaSolicitud: '',
  fechaConclusion: ''
};

@Component({
  selector: 'app-baja-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './baja-vehiculo.html',
  styleUrl: './baja-vehiculo.css'
})
export class BajaVehiculoComponent implements OnInit {

  registros: BajaVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: BajaVehiculo = { ...BAJA_VACIA };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: BajaVehiculo | null = null;

  motivosBaja = ['VIDA_UTIL', 'NO_APROBACION_RTV', 'SINIESTRO', 'ROBO', 'JUDICIAL'];
  estadosOpciones = ['CONCLUIDO', 'PENDIENTE', 'ANULADO'];
  notificadoSriOpciones = ['SI', 'NO'];

  constructor(
    private service: BajaVehiculoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar las bajas de vehículos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): BajaVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivoBaja?.toLowerCase().includes(f) ||
      r.descripcionMotivo?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idBaja?.toString() || '').includes(f)
    );
  }

  get paginados(): BajaVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...BAJA_VACIA };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: BajaVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.numeroTramite?.trim() || !this.editando.motivoBaja) return;
    this.guardando = true;
    const id = this.editando.idBaja;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    op.subscribe({
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar la baja del vehículo.'); }
    });
  }

  verDetalle(r: BajaVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'CONCLUIDO') return 'badge-concluido';
    if (estado === 'PENDIENTE') return 'badge-pendiente';
    if (estado === 'ANULADO') return 'badge-anulado';
    return '';
  }

  requiereChatarrizado(): boolean {
    return ['VIDA_UTIL', 'SINIESTRO'].includes(this.editando.motivoBaja);
  }

  requiereInspecciones(): boolean {
    return this.editando.motivoBaja === 'NO_APROBACION_RTV';
  }

  requiereOrdenJudicial(): boolean {
    return this.editando.motivoBaja === 'JUDICIAL';
  }

  requiereConstanciaPolicial(): boolean {
    return this.editando.motivoBaja === 'ROBO';
  }
}
