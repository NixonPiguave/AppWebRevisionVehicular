import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { TicketPagoService, TicketData } from '../../../services/operaciones/ticket-pago.service';

const SERVICIOS: { id: number; nombre: string }[] = [
  { id: 1,  nombre: 'Emisión de matrícula por Primera Vez.' },
  { id: 2,  nombre: 'Emisión de Documento Anual de Circulación' },
  { id: 3,  nombre: 'Duplicado de Documento de Matrícula.' },
  { id: 4,  nombre: 'Duplicado del Documento Anual de Circulación.' },
  { id: 5,  nombre: 'Transferencia de Dominio.' },
  { id: 6,  nombre: 'Cambio de Servicio.' },
  { id: 7,  nombre: 'Matriculación de Unidades de Carga' },
  { id: 8,  nombre: 'Cambio de Características' },
  { id: 9,  nombre: 'Bloqueo de vehículo' },
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
  cargandoTarifa = false;
  sinTarifa = false;

  mostrarModalTurno = false;
  busquedaTurno = '';
  cargando = false;
  cargandoTurnos = false;
  guardando = false;
  error = '';

  constructor(
    private turnosService: TurnosService,
    private propietarioService: PropietarioService,
    private empresaService: EmpresaService,
    private ticketService: TicketPagoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargarTurnos(); }

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
      error: () => {
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

  cerrarSelectorTurno(): void { this.mostrarModalTurno = false; }

  filtrarTurnos(): void {
    const f = (this.busquedaTurno || '').toLowerCase().trim();
    const sinPagar = this.turnos.filter(t => t.montoPagado == null);
    if (!f) {
      this.turnosFiltrados = sinPagar;
    } else {
      this.turnosFiltrados = sinPagar.filter(t =>
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
    this.montoPagado = null;
    this.sinTarifa = false;
    this.cerrarSelectorTurno();
    this.cargarTarifaDelTurno(t.turnoId!);
    this.cdr.detectChanges();
  }

  private cargarTarifaDelTurno(turnoId: number): void {
    this.cargandoTarifa = true;
    this.turnosService.obtenerTarifa(turnoId).subscribe({
      next: (res) => {
        this.montoPagado = res?.tarifa ?? null;
        this.sinTarifa = this.montoPagado === null;
        this.cargandoTarifa = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.montoPagado = null;
        this.sinTarifa = true;
        this.cargandoTarifa = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarTurno(): void {
    this.turnoSeleccionado = null;
    this.montoPagado = null;
    this.sinTarifa = false;
    this.cdr.detectChanges();
  }

  limpiarTodo(): void { this.limpiarTurno(); }

  getTurnoDisplay(): string {
    if (!this.turnoSeleccionado) return '';
    const t = this.turnoSeleccionado;
    return `#${t.turnoId} - Prop: ${t.propietarioId} | Veh: ${t.vehiculoId} | ${this.obtenerNombreServicio(t.servicioId)} | ${t.fechaInicio}`;
  }

  obtenerNombreServicio(servicioId?: number): string {
    if (!servicioId) return '-';
    return SERVICIOS.find(x => x.id === servicioId)?.nombre ?? String(servicioId);
  }

  montoValido(): boolean {
    return this.montoPagado != null && this.montoPagado >= 0;
  }

  registrarPago(): void {
    if (!this.turnoSeleccionado?.turnoId) { alert('Debe seleccionar un turno.'); return; }
    if (!this.montoValido()) { alert('Ingrese un monto válido (mayor o igual a 0).'); return; }

    const turnoSnap = { ...this.turnoSeleccionado };
    const montoSnap = Number(this.montoPagado);

    this.guardando = true;
    this.error = '';
    this.turnosService.registrarPago(turnoSnap.turnoId!, montoSnap).subscribe({
      next: () => {
        this.guardando = false;
        this.limpiarTodo();
        this.cargarTurnos();

        // Cargar propietario, empresa en paralelo → mostrar ticket
        forkJoin({
          propietario: turnoSnap.propietarioId
            ? this.propietarioService.obtenerPorId(turnoSnap.propietarioId).pipe(catchError(() => of(null)))
            : of(null),
          empresa: this.empresaService.obtenerPrimera().pipe(catchError(() => of(null)))
        }).subscribe(({ propietario, empresa }) => {
          const nombreServicio = this.obtenerNombreServicio(turnoSnap.servicioId);
          const hoy = new Date().toLocaleDateString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });

          const data: TicketData = {
            turnoId:           turnoSnap.turnoId!,
            tipoProceso:       nombreServicio,
            placa:             `Vehículo #${turnoSnap.vehiculoId}`,
            propietarioNombre: propietario
              ? `${(propietario as any).nombres ?? ''} ${(propietario as any).apellidos ?? ''}`.trim()
              : undefined,
            propietarioCedula: (propietario as any)?.documentoIdentidad ?? undefined,
            logoUrl:           empresa?.logoempresa || undefined,
            numero:            String(turnoSnap.turnoId).padStart(6, '0'),
            estado:            'PAGADO',
            fecha:             hoy,
            items:             [{ descripcion: nombreServicio, valor: montoSnap }],
            total:             montoSnap,
            ciudad:            'Quevedo'
          };

          this.ticketService.mostrar(data);
        });

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
