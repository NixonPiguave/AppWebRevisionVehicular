import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DesbloqueoVehiculoService, DesbloqueoVehiculo } from '../../../services/rtv/DesbloqueoVehiculo.service';

const DESBLOQUEO_VACIO: DesbloqueoVehiculo = {
  idDesbloqueo: null,
  tramiteId: null,
  bloqueoId: null,
  vehiculoId: null,
  entidadId: null,
  usuarioDesactivaId: null,
  numeroTramite: '',
  documentoLevantamiento: '',
  motivoLevantamiento: '',
  fechaDesactivacion: '',
  estado: 'CONCLUIDO'
};

@Component({
  selector: 'app-desbloqueo-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './desbloqueo-vehiculo.html',
  styleUrl: './desbloqueo-vehiculo.css'
})
export class DesbloqueoVehiculoComponent implements OnInit {

  registros: DesbloqueoVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: DesbloqueoVehiculo = { ...DESBLOQUEO_VACIO };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: DesbloqueoVehiculo | null = null;

  estadosOpciones = ['CONCLUIDO', 'ANULADO'];

  constructor(
    private service: DesbloqueoVehiculoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar los desbloqueos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): DesbloqueoVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivoLevantamiento?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idDesbloqueo?.toString() || '').includes(f)
    );
  }

  get paginados(): DesbloqueoVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...DESBLOQUEO_VACIO };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: DesbloqueoVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.numeroTramite?.trim() || !this.editando.motivoLevantamiento?.trim()) return;
    this.guardando = true;
    const id = this.editando.idDesbloqueo;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    op.subscribe({
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar el desbloqueo.'); }
    });
  }

  verDetalle(r: DesbloqueoVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'CONCLUIDO') return 'badge-concluido';
    if (estado === 'ANULADO') return 'badge-anulado';
    return '';
  }
}
