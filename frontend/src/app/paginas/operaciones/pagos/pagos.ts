import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TurnosService, TarifaConCalendarizacion } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { TicketPagoService, TicketData } from '../../../services/operaciones/ticket-pago.service';
import { VehiculoService, Vehiculo } from '../../../services/gestion_vehicular/vehiculo.service';
import { ModeloService, Modelo, Marca } from '../../../services/catalogos_vehiculos/modelos.service';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';

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
  tarifaConCalendarizacion: TarifaConCalendarizacion | null = null;
  cargandoTarifa = false;
  sinTarifa = false;
  servicios: Servicio[] = [];

  mostrarModalTurno = false;
  busquedaTurno = '';
  cargando = false;
  cargandoTurnos = false;
  guardando = false;
  error = '';

  private modalEnriquecida = false;
  private propietarioNombrePorId = new Map<number, string>();
  private vehiculoDescripcionPorId = new Map<number, string>();

  constructor(
    private turnosService: TurnosService,
    private servicioService: ServicioService,
    private propietarioService: PropietarioService,
    private empresaService: EmpresaService,
    private ticketService: TicketPagoService,
    private vehiculoService: VehiculoService,
    private modeloService: ModeloService,
    private cdr: ChangeDetectorRef
  ) {}

  // Catálogo de modelos y marcas para tickets pagados
  modelos: Modelo[] = [];
  marcas: Marca[] = [];

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarTurnos();
    this.cargarModelosYMarcas();
  }

  cargarServicios(): void {
    this.servicioService.listar().subscribe({
      next: (data) => { this.servicios = data ?? []; this.cdr.detectChanges(); },
      error: () => { this.servicios = []; this.cdr.detectChanges(); }
    });
  }

  cargarTurnos(): void {
    this.cargando = true;
    this.error = '';
    this.turnosService.getAll().subscribe({
      next: (data) => {
        this.turnos = data ?? [];
        // Al recargar datos (ej. luego de registrar un pago) hay que volver a enriquecer para mostrar nombre y marca/modelo
        this.modalEnriquecida = false;
        this.propietarioNombrePorId.clear();
        this.vehiculoDescripcionPorId.clear();
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

    if (this.modalEnriquecida) {
      this.filtrarTurnos();
      this.cdr.detectChanges();
      return;
    }

    this.cargandoTurnos = true;
    this.enriquecerTurnosSinPagoParaModal().subscribe({
      next: () => {
        this.cargandoTurnos = false;
        this.modalEnriquecida = true;
        this.filtrarTurnos();
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback: si falla el enriquecimiento, igual dejamos funcionar el selector
        this.cargandoTurnos = false;
        this.modalEnriquecida = true;
        this.filtrarTurnos();
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSelectorTurno(): void { this.mostrarModalTurno = false; }

  filtrarTurnos(): void {
    const f = (this.busquedaTurno || '').toLowerCase().trim();
    // Solo turnos sin pago y en estado GENERADO
    const sinPagar = this.turnos.filter(
      t => t.montoPagado == null && (t.estado || '').toUpperCase() === 'GENERADO'
    ).sort((a, b) => (b.turnoId ?? 0) - (a.turnoId ?? 0));

    if (!f) {
      this.turnosFiltrados = sinPagar;
    } else {
      this.turnosFiltrados = sinPagar.filter(t =>
        (t.turnoId?.toString() || '').includes(f) ||
        (t.propietarioNombre || '').toLowerCase().includes(f) ||
        (t.vehiculoDescripcion || '').toLowerCase().includes(f) ||
        (t.servicioId?.toString() || '').includes(f) ||
        (this.obtenerNombreServicio(t.servicioId) || '').toLowerCase().includes(f) ||
        (this.getEstadoLabel(t.estado).toLowerCase() || '').includes(f) ||
        (t.fechaInicio?.toString() || '').includes(f)
      );
    }
    this.cdr.detectChanges();
  }

  seleccionarTurno(t: Turnos): void {
    this.turnoSeleccionado = t;
    this.montoPagado = null;
    this.tarifaConCalendarizacion = null;
    this.sinTarifa = false;
    this.cerrarSelectorTurno();
    this.cargarTarifaDelTurno(t.turnoId!);
    this.cdr.detectChanges();
  }

  private cargarTarifaDelTurno(turnoId: number): void {
    this.cargandoTarifa = true;
    this.turnosService.obtenerTarifa(turnoId).subscribe({
      next: (res) => {
        // Usar total (tarifa base + recargo por calendarización)
        this.montoPagado = res?.total ?? res?.tarifa ?? null;
        this.sinTarifa = this.montoPagado === null;
        this.tarifaConCalendarizacion = res ?? null;
        this.cargandoTarifa = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.montoPagado = null;
        this.tarifaConCalendarizacion = null;
        this.sinTarifa = true;
        this.cargandoTarifa = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarTurno(): void {
    this.turnoSeleccionado = null;
    this.montoPagado = null;
    this.tarifaConCalendarizacion = null;
    this.sinTarifa = false;
    this.cdr.detectChanges();
  }

  limpiarTodo(): void { this.limpiarTurno(); }

  getTurnoDisplay(): string {
    if (!this.turnoSeleccionado) return '';
    const t = this.turnoSeleccionado;
    const propietario = t.propietarioNombre || `Propietario #${t.propietarioId}`;
    const vehiculo = t.vehiculoDescripcion || `Vehículo #${t.vehiculoId}`;
    return `TRN-${t.turnoId} - ${propietario} | ${vehiculo} | ${this.obtenerNombreServicio(t.servicioId)} | ${t.fechaInicio}`;
  }

  obtenerNombreServicio(servicioId?: number): string {
    if (!servicioId) return '-';
    return this.servicios.find(x => x.idTipoTramite === servicioId)?.nombre ?? String(servicioId);
  }

  getNombreMes(mes: number): string {
    if (mes < 1 || mes > 12) return 'N/A';
    const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombres[mes - 1];
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
          empresa: this.empresaService.obtenerPrimera().pipe(catchError(() => of(null))),
          vehiculo: turnoSnap.vehiculoId
            ? this.vehiculoService.obtenerPorId(turnoSnap.vehiculoId).pipe(catchError(() => of(null)))
            : of(null)
        }).subscribe(({ propietario, empresa, vehiculo }) => {
          const nombreServicio = this.obtenerNombreServicio(turnoSnap.servicioId);
          const hoy = new Date().toLocaleDateString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });

          let marcaNombre: string | undefined;
          let modeloNombre: string | undefined;
          if (vehiculo && (vehiculo as Vehiculo).modeloVehiculoId) {
            const modeloId = (vehiculo as Vehiculo).modeloVehiculoId;
            modeloNombre = this.obtenerNombreModeloPorId(modeloId);
            marcaNombre = this.obtenerNombreMarcaPorModeloId(modeloId);
          }

          const items: { descripcion: string; valor: number }[] = [
            { descripcion: nombreServicio, valor: this.tarifaConCalendarizacion?.tarifa ?? montoSnap }
          ];
          if (this.tarifaConCalendarizacion && this.tarifaConCalendarizacion.recargo > 0) {
            items.push({ descripcion: 'Recargo por calendarización', valor: this.tarifaConCalendarizacion.recargo });
          }

          const data: TicketData = {
            turnoId:           turnoSnap.turnoId!,
            tipoProceso:       nombreServicio,
            placa:             (vehiculo as Vehiculo | null)?.matricula || `Vehículo #${turnoSnap.vehiculoId}`,
            anio:              (vehiculo as Vehiculo | null)?.anioFabricacion ?? undefined,
            marca:             marcaNombre,
            modelo:            modeloNombre,
            propietarioNombre: propietario
              ? ((propietario as any)?.nombre ?? '').toString().trim()
              : undefined,
            propietarioCedula: (propietario as any)?.documentoIdentidad ?? undefined,
            logoUrl:           empresa?.logoempresa || undefined,
            numero:            String(turnoSnap.turnoId).padStart(6, '0'),
            estado:            'PAGADO',
            fecha:             hoy,
            items,
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

  // ── Modelos / marcas para tickets ────────────────────────────────
  private cargarModelosYMarcas(): void {
    this.modeloService.listar().subscribe({
      next: (modelos) => {
        this.modelos = modelos ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No se pudieron cargar modelos:', err)
    });
    this.modeloService.listarMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No se pudieron cargar marcas:', err)
    });
  }

  private obtenerNombreModeloPorId(id?: number): string | undefined {
    if (!id) return undefined;
    const modelo = this.modelos.find(m => m.id === id);
    return modelo?.nombre;
  }

  private obtenerNombreMarcaPorModeloId(idModelo?: number): string | undefined {
    if (!idModelo) return undefined;
    const modelo = this.modelos.find(m => m.id === idModelo);
    if (!modelo) return undefined;
    const marca = this.marcas.find(ma => ma.id === modelo.marcaId);
    return marca?.nombre;
  }

  private enriquecerTurnosSinPagoParaModal(): Observable<void> {
    const sinPagar = this.turnos.filter(
      t => t.montoPagado == null && (t.estado || '').toUpperCase() === 'GENERADO'
    );

    if (sinPagar.length === 0) return of(void 0);

    const propietarioIds = [...new Set(sinPagar.map(t => t.propietarioId))];
    const vehiculoIds = [...new Set(sinPagar.map(t => t.vehiculoId).filter((x): x is number => typeof x === 'number'))];

    const propietarios$ = forkJoin(
      propietarioIds.map(id =>
        this.propietarioService.obtenerPorId(id).pipe(
          catchError(() => of({ idPropietario: id, nombre: `Propietario #${id}` } as any))
        )
      )
    );

    const vehiculos$ = forkJoin(
      vehiculoIds.map(id =>
        this.vehiculoService.obtenerPorId(id).pipe(
          catchError(() => of({ id, matricula: `Vehículo #${id}` } as any))
        )
      )
    );

    return forkJoin({ propietarios: propietarios$, vehiculos: vehiculos$ }).pipe(
      map(({ propietarios, vehiculos }) => {
        propietarios.forEach((p: any) => {
          const id = p?.idPropietario ?? p?.id ?? p?.propietarioId;
          if (typeof id === 'number') {
            this.propietarioNombrePorId.set(id, (p?.nombre ?? `Propietario #${id}`));
          }
        });

        vehiculos.forEach((v: any) => {
          const id = v?.id ?? v?.vehiculoId ?? v?.idVehiculo;
          if (typeof id === 'number') {
            this.vehiculoDescripcionPorId.set(id, this.construirVehiculoDescripcion(v, id));
          }
        });

        this.turnos = this.turnos.map(t => {
          if (t.montoPagado != null) return t;
          if ((t.estado || '').toUpperCase() !== 'GENERADO') return t;
          return {
            ...t,
            propietarioNombre: this.propietarioNombrePorId.get(t.propietarioId),
            vehiculoDescripcion: (t.vehiculoId != null) ? this.vehiculoDescripcionPorId.get(t.vehiculoId) : '-',
          };
        });
      })
    );
  }

  private construirVehiculoDescripcion(veh: Vehiculo | any, fallbackId: number): string {
    if (!veh) return `Vehículo #${fallbackId}`;

    const marca = veh.marcaNombre ?? '';
    const modelo = veh.modeloNombre ?? '';
    const placa = veh.matricula ?? '';
    const anio = veh.anioFabricacion ?? undefined;

    let base = '';
    if (marca && modelo) base = `${marca} ${modelo}`;
    else if (marca) base = `${marca}`;
    else if (modelo) base = `${modelo}`;

    if (!base) base = `Vehículo #${fallbackId}`;

    if (anio != null && anio !== undefined) base = `${base} (${anio})`;
    if (placa) base = `${base} (${placa})`;

    return base;
  }

  getEstadoLabel(estado?: string): string {
    return (estado || '').replace(/_/g, ' ');
  }

  getBadgeClassEstado(estado?: string): string {
    const e = (estado || '').toUpperCase();
    if (e === 'GENERADO') return 'badge-generado';
    if (e === 'CONFIRMADO') return 'badge-confirmado';
    if (e === 'ATENDIDO') return 'badge-atendido';
    if (e === 'CANCELADO') return 'badge-cancelado';
    if (e === 'PAGADO') return 'badge-pagado';
    if (e === 'EN_PROCESO') return 'badge-en-proceso';
    return 'badge-generado';
  }
}
