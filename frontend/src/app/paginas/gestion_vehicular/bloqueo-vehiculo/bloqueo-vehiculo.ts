import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BloqueoVehiculoService, BloqueoVehiculo } from '../../../services/rtv/BloqueoVehiculo.service';

const BLOQUEO_VACIO: BloqueoVehiculo = {
  idBloqueoSrv: null,
  tramiteId: null,
  vehiculoId: null,
  entidadId: null,
  usuarioActivaId: null,
  numeroTramite: '',
  tipoBloqueoId: null,
  motivo: '',
  procesosBloqueados: 'TODOS',
  documentoHabilitante: '',
  institucionOrigen: '',
  fechaActivacion: '',
  estado: 'ACTIVO',
  observaciones: ''
};

@Component({
  selector: 'app-bloqueo-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './bloqueo-vehiculo.html',
  styleUrl: './bloqueo-vehiculo.css'
})
export class BloqueoVehiculoComponent implements OnInit {

  registros: BloqueoVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: BloqueoVehiculo = { ...BLOQUEO_VACIO };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: BloqueoVehiculo | null = null;

  procesosBloqueadosOpciones = ['TODOS', 'TRANSFERENCIA', 'CASOS_ESPECIALES'];
  estadosOpciones = ['ACTIVO', 'DESACTIVADO'];

  constructor(
    private service: BloqueoVehiculoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar los bloqueos de vehículos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): BloqueoVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivo?.toLowerCase().includes(f) ||
      r.institucionOrigen?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idBloqueoSrv?.toString() || '').includes(f)
    );
  }

  get paginados(): BloqueoVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...BLOQUEO_VACIO };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: BloqueoVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.numeroTramite?.trim() || !this.editando.motivo?.trim()) return;
    this.guardando = true;
    const id = this.editando.idBloqueoSrv;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    op.subscribe({
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar el bloqueo.'); }
    });
  }

  verDetalle(r: BloqueoVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'ACTIVO') return 'badge-activo';
    if (estado === 'DESACTIVADO') return 'badge-desactivado';
    return '';
  }
}
