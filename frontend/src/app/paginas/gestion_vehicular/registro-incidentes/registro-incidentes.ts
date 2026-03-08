import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IncidenteService, Incidente } from '../../../services/rtv/Incidente.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { NotificationService } from '../../../services/notification.service';

const INC_VACIO: Incidente = {
  entidadId: null,
  numeroIncidente: '',
  tipoIncidente: 'GENERAL',
  descripcion: '',
  estado: 'ABIERTO'
};

@Component({
  selector: 'app-registro-incidentes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './registro-incidentes.html',
  styleUrl: './registro-incidentes.css'
})
export class RegistroIncidentesComponent implements OnInit {
  registros: Incidente[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;
  mostrarModalForm = false;
  modoEdicion = false;
  editando: Incidente = { ...INC_VACIO };
  guardando = false;
  mostrarModalDetalle = false;
  detalle: Incidente | null = null;
  detalleVehiculo: Vehiculo | null = null;
  detalleEntidadNombre = '';
  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];
  estadosOpciones = ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'NO_PROCEDE'];
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  constructor(
    private service: IncidenteService,
    private vehiculoService: VehiculoService,
    private entidadesTransitoService: EntidadesTransitoService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.entidadesTransitoService.listar().subscribe({
      next: (data) => {
        this.entidadesTransito = (data ?? []).map(e => ({ idEntidad: e.idEntidad, codigo: e.codigo, nombre: e.nombre }));
        this.cdr.detectChanges();
      }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar incidentes.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): Incidente[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroIncidente?.toLowerCase().includes(f) ||
      r.tipoIncidente?.toLowerCase().includes(f) ||
      r.descripcion?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idIncidente?.toString() || '').includes(f)
    );
  }

  get paginados(): Incidente[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...INC_VACIO };
    this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: Incidente): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.entidadId) {
      this.notification.error('Debe seleccionar entidad de tránsito.');
      return;
    }
    if (!this.editando.descripcion?.trim()) {
      this.notification.error('Debe indicar la descripción del incidente.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idIncidente;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);
    op.subscribe({
      next: () => {
        this.cargar();
        this.cerrarModalForm();
        this.guardando = false;
        this.notification.success(this.modoEdicion ? 'Incidente actualizado.' : 'Incidente registrado.');
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar.'); }
    });
  }

  verDetalle(r: Incidente): void {
    this.detalle = r;
    this.detalleVehiculo = null;
    this.detalleEntidadNombre = '';
    if (r.vehiculoId) this.vehiculoService.obtenerPorId(r.vehiculoId).subscribe({
      next: (v) => { this.detalleVehiculo = v; this.cdr.detectChanges(); }
    });
    if (r.entidadId) {
      const ent = this.entidadesTransito.find(e => e.idEntidad === r.entidadId);
      this.detalleEntidadNombre = ent ? `${ent.codigo} - ${ent.nombre}` : '';
    }
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (!estado) return '';
    const e = estado.toUpperCase();
    if (e === 'RESUELTO') return 'badge-concluido';
    if (e === 'ABIERTO' || e === 'EN_PROCESO') return 'badge-activo';
    return 'badge-pendiente';
  }

  abrirSelectorVehiculo(): void {
    this.mostrarModalVehiculo = true;
    this.busquedaPlaca = '';
    this.vehiculosEncontrados = [];
    this.cargandoVehiculos = false;
  }

  cerrarSelectorVehiculo(): void { this.mostrarModalVehiculo = false; }

  buscarVehiculos(): void {
    if (!this.busquedaPlaca?.trim()) return;
    this.cargandoVehiculos = true;
    this.vehiculoService.buscarPorPlaca(this.busquedaPlaca).subscribe({
      next: (data) => {
        this.vehiculosEncontrados = data ?? [];
        this.cargandoVehiculos = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoVehiculos = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    const id = v.id ?? (v as any).vehiculoid;
    this.editando.vehiculoId = id as number;
    this.vehiculoSeleccionadoInfo = v;
    this.cerrarSelectorVehiculo();
  }

  limpiarVehiculo(): void {
    this.editando.vehiculoId = null;
    this.vehiculoSeleccionadoInfo = null;
  }

  cargarVehiculoPorId(id: number): void {
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v) => { this.vehiculoSeleccionadoInfo = v; this.cdr.detectChanges(); },
      error: () => { this.vehiculoSeleccionadoInfo = null; }
    });
  }
}
