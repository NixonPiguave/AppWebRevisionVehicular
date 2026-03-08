import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegistroBaseUnicaVehiculoService, RegistroBaseUnicaVehiculo } from '../../../services/rtv/RegistroBaseUnicaVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-registro-base-unica',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './registro-base-unica.html',
  styleUrl: './registro-base-unica.css'
})
export class RegistroBaseUnicaComponent implements OnInit {
  registros: RegistroBaseUnicaVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;
  mostrarModalForm = false;
  modoEdicion = false;
  editando: RegistroBaseUnicaVehiculo = {
    vehiculoId: null,
    tipoOrigen: 'NUEVO',
    fechaRegistro: new Date().toISOString().slice(0, 10),
    estado: 'REGISTRADO'
  };
  guardando = false;
  mostrarModalDetalle = false;
  detalle: RegistroBaseUnicaVehiculo | null = null;
  detalleVehiculo: Vehiculo | null = null;
  tiposOrigen = ['NUEVO', 'IMPORTADO', 'REMATE', 'DONACION', 'ESTATAL', 'OTRO'];
  estadosOpciones = ['REGISTRADO', 'RECHAZADO', 'ANULADO'];
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  constructor(
    private service: RegistroBaseUnicaVehiculoService,
    private vehiculoService: VehiculoService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar registros.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): RegistroBaseUnicaVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.tipoOrigen?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idRegistroBaseUnica?.toString() || '').includes(f)
    );
  }

  get paginados(): RegistroBaseUnicaVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = {
      vehiculoId: null,
      tipoOrigen: 'NUEVO',
      documentoOrigen: '',
      fechaRegistro: new Date().toISOString().slice(0, 10),
      estado: 'REGISTRADO'
    };
    this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: RegistroBaseUnicaVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.vehiculoId) {
      this.notification.error('Debe seleccionar un vehículo.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idRegistroBaseUnica;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);
    op.subscribe({
      next: () => {
        this.cargar();
        this.cerrarModalForm();
        this.guardando = false;
        this.notification.success(this.modoEdicion ? 'Registro actualizado.' : 'Vehículo registrado en base única.');
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar.'); }
    });
  }

  verDetalle(r: RegistroBaseUnicaVehiculo): void {
    this.detalle = r;
    this.detalleVehiculo = null;
    if (r.vehiculoId) this.vehiculoService.obtenerPorId(r.vehiculoId).subscribe({
      next: (v) => { this.detalleVehiculo = v; this.cdr.detectChanges(); }
    });
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (!estado) return '';
    const e = estado.toUpperCase();
    if (e === 'REGISTRADO') return 'badge-activo';
    if (e === 'RECHAZADO' || e === 'ANULADO') return 'badge-pendiente';
    return 'badge-concluido';
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
      next: (data) => { this.vehiculosEncontrados = data ?? []; this.cargandoVehiculos = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoVehiculos = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    const id = v.id ?? (v as any).vehiculoid;
    this.editando.vehiculoId = id as number;
    this.vehiculoSeleccionadoInfo = v;
    this.cerrarSelectorVehiculo();
  }

  limpiarVehiculo(): void { this.editando.vehiculoId = null; this.vehiculoSeleccionadoInfo = null; }

  cargarVehiculoPorId(id: number): void {
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v) => { this.vehiculoSeleccionadoInfo = v; this.cdr.detectChanges(); },
      error: () => { this.vehiculoSeleccionadoInfo = null; }
    });
  }
}
