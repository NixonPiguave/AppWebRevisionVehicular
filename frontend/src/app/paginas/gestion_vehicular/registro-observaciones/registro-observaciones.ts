import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RegistroObservacionService, RegistroObservacion } from '../../../services/rtv/RegistroObservacion.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { NotificationService } from '../../../services/notification.service';

const OBS_VACIO: RegistroObservacion = {
  vehiculoId: null,
  entidadId: null,
  numeroTramite: '',
  tipoObservacion: 'CAMBIO_MOTOR',
  descripcion: '',
  documentoSoporte: '',
  generaBloqueoCoby: 'NO',
  estado: 'ACTIVA'
};

@Component({
  selector: 'app-registro-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './registro-observaciones.html',
  styleUrl: './registro-observaciones.css'
})
export class RegistroObservacionesComponent implements OnInit {

  registros: RegistroObservacion[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: RegistroObservacion = { ...OBS_VACIO };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: RegistroObservacion | null = null;
  detalleVehiculo: Vehiculo | null = null;
  detalleEntidadNombre = '';

  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];
  tiposObservacion = ['BAJA_VEHICULO', 'CAMBIO_SERVICIO', 'GEMELO', 'CAMBIO_MOTOR', 'REMARCADO'];
  estadosOpciones = ['ACTIVA', 'LEVANTADA'];

  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  constructor(
    private service: RegistroObservacionService,
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
      error: () => { this.error = 'Error al cargar el registro de observaciones.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): RegistroObservacion[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.tipoObservacion?.toLowerCase().includes(f) ||
      r.descripcion?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idObservacionSrv?.toString() || '').includes(f)
    );
  }

  get paginados(): RegistroObservacion[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...OBS_VACIO };
    this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: RegistroObservacion): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.vehiculoId || !this.editando.entidadId) {
      this.notification.error('Debe seleccionar vehículo y entidad de tránsito.');
      return;
    }
    if (!this.editando.descripcion?.trim()) {
      this.notification.error('Debe indicar la descripción de la observación.');
      return;
    }
    this.guardando = true;
    if (!this.modoEdicion && !this.editando.numeroTramite) {
      this.editando.numeroTramite = 'OBS-' + Date.now();
    }
    const id = this.editando.idObservacionSrv;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);
    op.subscribe({
      next: () => {
        this.cargar();
        this.cerrarModalForm();
        this.guardando = false;
        this.notification.success(this.modoEdicion ? 'Observación actualizada.' : 'Observación registrada.');
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar.'); }
    });
  }

  verDetalle(r: RegistroObservacion): void {
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
    if (e === 'ACTIVA') return 'badge-activo';
    if (e === 'LEVANTADA') return 'badge-concluido';
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
