import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';

const SERVICIOS: { id: number; nombre: string }[] = [
  { id: 1, nombre: 'Emisión de matrícula por Primera Vez.' },
  { id: 2, nombre: 'Emisión de Documento Anual de Circulación' },
  { id: 3, nombre: 'Duplicado de Documento de Matrícula.' },
  { id: 4, nombre: 'Duplicado del Documento Anual de Circulación.' },
  { id: 5, nombre: 'Transferencia de Dominio.' },
  { id: 6, nombre: 'Cambio de Servicio.' },
  { id: 7, nombre: 'Matriculación de Unidades de Carga' },
  { id: 8, nombre: 'Cambio de Características' },
  { id: 9, nombre: 'Bloqueo de vehículo' },
  { id: 10, nombre: 'Desbloqueo de vehículo' },
  { id: 11, nombre: 'Registro de Observaciones' },
  { id: 12, nombre: 'Baja de vehículos' },
  { id: 13, nombre: 'Registro de Incidentes' },
  { id: 14, nombre: 'Anulación de Trámites' },
  { id: 15, nombre: 'Registro en Base Única Nacional' },
  { id: 16, nombre: 'Casos especiales' }
];

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css'
})
export class PagosComponent implements OnInit {

  turnos: Turnos[] = [];
  turnosFiltrados: Turnos[] = [];
  turnoSeleccionado: Turnos | null = null;
  montoPagado: number | null = null;

  mostrarModalTurno = false;
  busquedaTurno = '';
  cargando = false;
  cargandoTurnos = false;
  guardando = false;
  error = '';

  constructor(
    private turnosService: TurnosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    this.cargando = true;
    this.error = '';
    this.turnosService.getAll().subscribe({
      next: (data) => {
        this.turnos = data ?? [];
        this.turnosFiltrados = [...this.turnos];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los turnos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirSelectorTurno(): void {
    this.mostrarModalTurno = true;
    this.busquedaTurno = '';
    this.filtrarTurnos();
    this.cdr.detectChanges();
  }

  cerrarSelectorTurno(): void {
    this.mostrarModalTurno = false;
  }

  filtrarTurnos(): void {
    const f = (this.busquedaTurno || '').toLowerCase().trim();
    if (!f) {
      this.turnosFiltrados = [...this.turnos];
    } else {
      this.turnosFiltrados = this.turnos.filter(t =>
        (t.turnoId?.toString() || '').includes(f) ||
        (t.propietarioId?.toString() || '').includes(f) ||
        (t.vehiculoId?.toString() || '').includes(f) ||
        (t.servicioId?.toString() || '').includes(f) ||
        (t.estado?.toLowerCase() || '').includes(f) ||
        (t.fechaInicio?.toString() || '').includes(f)
      );
    }
    this.cdr.detectChanges();
  }

  seleccionarTurno(t: Turnos): void {
    this.turnoSeleccionado = t;
    this.montoPagado = t.montoPagado != null ? Number(t.montoPagado) : null;
    this.cerrarSelectorTurno();
    this.cdr.detectChanges();
  }

  limpiarTurno(): void {
    this.turnoSeleccionado = null;
    this.montoPagado = null;
    this.cdr.detectChanges();
  }

  limpiarTodo(): void {
    this.limpiarTurno();
  }

  getTurnoDisplay(): string {
    if (!this.turnoSeleccionado) return '';
    const t = this.turnoSeleccionado;
    return `#${t.turnoId} - Prop: ${t.propietarioId} | Veh: ${t.vehiculoId} | ${this.obtenerNombreServicio(t.servicioId)} | ${t.fechaInicio}`;
  }

  obtenerNombreServicio(servicioId?: number): string {
    if (!servicioId) return '-';
    const s = SERVICIOS.find(x => x.id === servicioId);
    return s ? s.nombre : String(servicioId);
  }

  montoValido(): boolean {
    return this.montoPagado != null && this.montoPagado >= 0;
  }

  registrarPago(): void {
    if (!this.turnoSeleccionado?.turnoId) {
      alert('Debe seleccionar un turno.');
      return;
    }
    if (!this.montoValido()) {
      alert('Ingrese un monto válido (mayor o igual a 0).');
      return;
    }

    this.guardando = true;
    this.error = '';
    this.turnosService.registrarPago(this.turnoSeleccionado.turnoId, Number(this.montoPagado)).subscribe({
      next: () => {
        alert('Pago registrado correctamente.');
        this.limpiarTodo();
        this.cargarTurnos();
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.message || 'Error al registrar el pago.';
        this.cdr.detectChanges();
      }
    });
  }
}
