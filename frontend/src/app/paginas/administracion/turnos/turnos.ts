import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { Propietario, PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { TicketPagoService, TicketData } from '../../../services/operaciones/ticket-pago.service';
import { ModeloService, Modelo, Marca } from '../../../services/catalogos_vehiculos/modelos.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, MatIconModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css']
})
export class TurnosComponent implements OnInit {
  turnos: Turnos[] = [];
  turnoSeleccionado: Turnos | null = null;
  modoEdicion = false;
  mostrarFormulario = false;

  servicios: Servicio[] = [];

  mostrarModalPropietario = false;
  cargandoPropietarios = false;
  propietariosElegibles: Propietario[] = [];
  busquedaCedula = '';
  propietarioSeleccionadoInfo: Propietario | null = null;
  propietarioPageIndex = 0;
  propietarioPageSize = 10;

  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  // Mapas auxiliares para mostrar nombre de propietario y placa en la tabla
  propietariosMapa = new Map<number, Propietario>();
  vehiculosMapa = new Map<number, Vehiculo>();

  // Catálogo de modelos y marcas para los tickets
  modelos: Modelo[] = [];
  marcas: Marca[] = [];

  turnoForm: Turnos = {
    propietarioId: 0, vehiculoId: 0, servicioId: 0, fechaInicio: '', estado: 'GENERADO'
  };

  constructor(
    private turnosService: TurnosService,
    private servicioService: ServicioService,
    private propietarioService: PropietarioService,
    private vehiculoService: VehiculoService,
    private empresaService: EmpresaService,
    private ticketService: TicketPagoService,
    private modeloService: ModeloService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarTurnos();
    this.cargarReferenciasPropietarios();
    this.cargarReferenciasVehiculos();
    this.cargarModelosYMarcas();
    // Mantener el formulario visible para seguir creando tickets sin ocultar el "menú".
    this.nuevoTurno();
    this.route.queryParams.subscribe(params => {
      if (params['nuevo'] === '1' || params['nuevo'] === 'true') {
        this.nuevoTurno();
        if (params['propietarioId']) {
          this.turnoForm.propietarioId = Number(params['propietarioId']);
          this.cargarPropietarioPorId(this.turnoForm.propietarioId);
        }
        if (params['vehiculoId']) {
          this.turnoForm.vehiculoId = Number(params['vehiculoId']);
          this.cargarVehiculoPorId(this.turnoForm.vehiculoId);
        }
        if (params['servicioId']) this.turnoForm.servicioId = Number(params['servicioId']);
      }
    });
  }

  cargarServicios(): void {
    this.servicioService.listar().subscribe({
      next: (data) => {
        this.servicios = data ?? [];
        this.cdr.detectChanges();
      },
      error: () => { this.servicios = []; this.cdr.detectChanges(); }
    });
  }

  cargarTurnos(): void {
    this.turnosService.getAll().subscribe({
      next: (data) => {
        // Solo mostrar turnos en estado GENERADO en esta vista
        this.turnos = (data ?? []).filter(
          (t) => (t.estado || '').toUpperCase() === 'GENERADO'
        );
        this.cdr.detectChanges();
      },
      error: (err)  => { console.error('Error al cargar turnos:', err); this.cdr.detectChanges(); }
    });
  }

  nuevoTurno(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.propietarioSeleccionadoInfo = null;
    this.vehiculoSeleccionadoInfo = null;

    // Fecha de inicio automática: hoy (el procedimiento se encarga de fecha_fin)
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const day = hoy.getDate().toString().padStart(2, '0');
    const fechaInicio = `${year}-${month}-${day}`;

    this.turnoForm = {
      propietarioId: 0,
      vehiculoId: 0,
      servicioId: 0,
      fechaInicio,
      estado: 'GENERADO'
    };
  }

  editarTurno(turno: Turnos): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.turnoSeleccionado = turno;
    this.turnoForm = { ...turno };
    this.propietarioSeleccionadoInfo = null;
    this.vehiculoSeleccionadoInfo = null;
    if (this.turnoForm.propietarioId) this.cargarPropietarioPorId(this.turnoForm.propietarioId);
    if (this.turnoForm.vehiculoId)    this.cargarVehiculoPorId(this.turnoForm.vehiculoId);
  }

  guardarTurno(): void {
    if (!this.turnoForm.propietarioId || this.turnoForm.propietarioId <= 0) {
      this.notification.error('Debe seleccionar un propietario por cédula');
      return;
    }
    if (!this.turnoForm.vehiculoId || this.turnoForm.vehiculoId <= 0) {
      this.notification.error('Debe seleccionar un vehículo por placa');
      return;
    }
    if (!this.turnoForm.servicioId || this.turnoForm.servicioId <= 0) {
      this.notification.error('Debe seleccionar un servicio');
      return;
    }
    // Si por alguna razón viene sin fecha, la rellenamos con hoy
    if (!this.turnoForm.fechaInicio) {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const day = hoy.getDate().toString().padStart(2, '0');
      this.turnoForm.fechaInicio = `${year}-${month}-${day}`;
    }

    if (this.modoEdicion && this.turnoSeleccionado?.turnoId) {
      this.turnosService.update(this.turnoSeleccionado.turnoId, this.turnoForm).subscribe({
        next: () => {
          this.notification.success('Turno actualizado correctamente');
          this.cargarTurnos();
          this.cancelar();
        },
        error: (err) => {
          console.error('Error al actualizar turno:', err);
          this.notification.error('Error al actualizar el turno');
        }
      });
    } else {
      // Capturar snapshots antes de crear
      const vehiculoSnap     = this.vehiculoSeleccionadoInfo;
      const propietarioSnap  = this.propietarioSeleccionadoInfo;
      const servicioId       = this.turnoForm.servicioId;

      this.turnosService.create(this.turnoForm).subscribe({
        next: (turnoCreado) => {
          this.notification.success('Turno creado correctamente');
          this.cargarTurnos();
          // No ocultar el formulario al crear un ticket nuevo.
          // Resetear el formulario para permitir crear otro.
          this.nuevoTurno();

          // Consultar tarifa y logo en paralelo
          forkJoin({
            tarifa:  this.turnosService.obtenerTarifa(turnoCreado.turnoId!).pipe(catchError(() => of(null))),
            empresa: this.empresaService.obtenerPrimera().pipe(catchError(() => of(null)))
          }).subscribe(({ tarifa, empresa }) => {
            this.mostrarTicketNuevoTurno(
              turnoCreado, vehiculoSnap, propietarioSnap,
              servicioId, tarifa?.tarifa ?? 0, empresa?.logoempresa
            );
          });
        },
        error: (err) => {
          console.error('Error al crear turno:', err);
          this.notification.error('Error al crear el turno');
        }
      });
    }
  }

  private mostrarTicketNuevoTurno(
    turno: Turnos,
    vehiculo: Vehiculo | null,
    propietario: Propietario | null,
    servicioId: number,
    monto: number,
    logoUrl?: string
  ): void {
    const nombreServicio = this.servicios.find(s => s.idTipoTramite === servicioId)?.nombre || '-';

    // Marca y modelo para el ticket (si tenemos modeloVehiculoId)
    const modeloNombre = vehiculo?.modeloVehiculoId
      ? this.obtenerNombreModeloPorId(vehiculo.modeloVehiculoId)
      : undefined;
    const marcaNombre = vehiculo?.modeloVehiculoId
      ? this.obtenerNombreMarcaPorModeloId(vehiculo.modeloVehiculoId)
      : undefined;
    const hoy = new Date().toLocaleDateString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const data: TicketData = {
      turnoId:            turno.turnoId ?? 0,
      tipoProceso:        nombreServicio,
      placa:              vehiculo?.matricula        || `Vehículo #${turno.vehiculoId}`,
      anio:               vehiculo?.anioFabricacion  ?? undefined,
      marca:              marcaNombre,
      modelo:             modeloNombre,
      propietarioNombre:  propietario
        ? `${propietario.nombre ?? ''} ${propietario.telefono ?? ''}`.trim()
        : undefined,
      propietarioCedula:  propietario?.documentoIdentidad ?? undefined,
      logoUrl:            logoUrl || undefined,
      numero:             String(turno.turnoId ?? '').padStart(6, '0'),
      estado:             monto > 0 ? 'POR PAGAR' : 'SIN TARIFA ACTIVA',
      fecha:              hoy,
      items:              [{ descripcion: nombreServicio, valor: monto }],
      total:              monto,
      ciudad:             'Valencia'
    };

    this.ticketService.mostrar(data);
  }

  abrirInspeccion(turno: Turnos): void {
    if (!turno.turnoId || !turno.vehiculoId) {
      this.notification.error('Este turno no tiene vehículo asociado.');
      return;
    }
    this.router.navigate(['/inicio/inspeccion-rtv/registrar'], {
      queryParams: { turnoId: turno.turnoId, vehiculoId: turno.vehiculoId }
    });
  }

  esTurnoPagado(turno: Turnos): boolean {
    return (turno.estado || '').toUpperCase() === 'PAGADO';
  }

  eliminarTurno(id: number): void {
    if (confirm('¿Está seguro de cancelar este turno?')) {
      this.turnosService.cambiarEstado(id, 'CANCELADO').subscribe({
        next: () => {
          this.notification.success('Turno cancelado correctamente');
          this.cargarTurnos();
        },
        error: (err) => {
          console.error('Error al cancelar turno:', err);
          this.notification.error('Error al cancelar el turno');
        }
      });
    }
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.turnoSeleccionado = null;
  }

  // ── Propietario ──────────────────────────────────────────────────
  abrirSelectorPropietario(): void {
    this.mostrarModalPropietario = true;
    this.busquedaCedula = this.propietarioSeleccionadoInfo?.documentoIdentidad ?? this.busquedaCedula;
    this.propietarioPageSize = 10;
    this.buscarPropietariosElegibles();
    this.cdr.detectChanges();
  }

  cerrarSelectorPropietario(): void {
    this.mostrarModalPropietario = false;
    this.cdr.detectChanges();
  }

  buscarPropietariosElegibles(): void {
    this.cargandoPropietarios = true;
    this.propietariosElegibles = [];
    this.propietarioPageIndex = 0;
    this.propietarioService.listarElegibles(this.busquedaCedula).subscribe({
      next: (data) => {
        this.propietariosElegibles = data ?? [];
        this.cargandoPropietarios = false;
        (data ?? []).forEach(p => {
          if (p.idPropietario != null) this.propietariosMapa.set(p.idPropietario, p);
        });
        this.cdr.detectChanges();
      },
      error: (err)  => {
        console.error('Error:', err);
        this.cargandoPropietarios = false;
        this.cdr.detectChanges();
      }
    });
  }

  get propietariosElegiblesTotal(): number {
    return this.propietariosElegibles.length;
  }

  get propietariosElegiblesPageCount(): number {
    const total = this.propietariosElegiblesTotal;
    return Math.max(1, Math.ceil(total / this.propietarioPageSize));
  }

  get propietariosElegiblesPageStart(): number {
    return this.propietarioPageIndex * this.propietarioPageSize;
  }

  get propietariosElegiblesPageEnd(): number {
    return Math.min(this.propietariosElegiblesPageStart + this.propietarioPageSize, this.propietariosElegiblesTotal);
  }

  get propietariosElegiblesPaginados(): Propietario[] {
    const start = this.propietariosElegiblesPageStart;
    return this.propietariosElegibles.slice(start, start + this.propietarioPageSize);
  }

  propietarioIrPrimeraPagina(): void {
    this.propietarioPageIndex = 0;
  }

  propietarioAnteriorPagina(): void {
    this.propietarioPageIndex = Math.max(0, this.propietarioPageIndex - 1);
  }

  propietarioSiguientePagina(): void {
    const lastIndex = this.propietariosElegiblesPageCount - 1;
    this.propietarioPageIndex = Math.min(lastIndex, this.propietarioPageIndex + 1);
  }

  propietarioCambiarPageSize(value: string | number): void {
    const next = Number(value);
    this.propietarioPageSize = Number.isFinite(next) && next > 0 ? next : 10;
    this.propietarioIrPrimeraPagina();
  }

  seleccionarPropietario(p: Propietario): void {
    this.propietarioSeleccionadoInfo = p;
    this.turnoForm.propietarioId = (p.idPropietario ?? 0) as number;
    this.cerrarSelectorPropietario();
    if (p.idPropietario != null) this.propietariosMapa.set(p.idPropietario, p);
    this.cdr.detectChanges();
  }

  limpiarPropietario(): void {
    this.propietarioSeleccionadoInfo = null;
    this.turnoForm.propietarioId = 0;
    this.cdr.detectChanges();
  }

  private cargarPropietarioPorId(id: number): void {
    if (!id || id <= 0) return;
    this.propietarioService.obtenerPorId(id).subscribe({
      next: (p) => {
        this.propietarioSeleccionadoInfo = p;
        if (p.idPropietario != null) this.propietariosMapa.set(p.idPropietario, p);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('No se pudo cargar propietario:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Vehículo ─────────────────────────────────────────────────────
  abrirSelectorVehiculo(): void {
    this.mostrarModalVehiculo = true;
    this.busquedaPlaca = this.vehiculoSeleccionadoInfo?.matricula ?? this.busquedaPlaca;
    this.buscarVehiculos();
    this.cdr.detectChanges();
  }

  cerrarSelectorVehiculo(): void {
    this.mostrarModalVehiculo = false;
    this.cdr.detectChanges();
  }

  /**
   * ✅ Buscar vehículos filtrando solo los del propietario seleccionado
   */
  buscarVehiculos(): void {
    // Validar que haya un propietario seleccionado primero
    if (!this.turnoForm.propietarioId || this.turnoForm.propietarioId <= 0) {
      this.notification.error('Primero debe seleccionar un propietario');
      this.cerrarSelectorVehiculo();
      return;
    }

    this.cargandoVehiculos = true;
    this.vehiculosEncontrados = [];

    this.vehiculoService.buscarPorPlaca(this.busquedaPlaca).subscribe({
      next: (data) => {
        // ✅ Filtrar solo los vehículos que pertenecen al propietario seleccionado
        this.vehiculosEncontrados = (data ?? []).filter(
          v => v.propietarioId === this.turnoForm.propietarioId
        );

        this.cargandoVehiculos = false;

        (data ?? []).forEach(v => {
          if (v.id != null) this.vehiculosMapa.set(v.id, v);
        });

        this.cdr.detectChanges();
      },
      error: (err)  => {
        console.error('Error:', err);
        this.cargandoVehiculos = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    this.vehiculoSeleccionadoInfo = v;
    this.turnoForm.vehiculoId = (v.id ?? 0) as number;
    this.cerrarSelectorVehiculo();
    if (v.id != null) this.vehiculosMapa.set(v.id, v);
    this.cdr.detectChanges();
  }

  limpiarVehiculo(): void {
    this.vehiculoSeleccionadoInfo = null;
    this.turnoForm.vehiculoId = 0;
    this.cdr.detectChanges();
  }

  private cargarVehiculoPorId(id: number): void {
    if (!id || id <= 0) return;
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v) => {
        this.vehiculoSeleccionadoInfo = v;
        if (v.id != null) this.vehiculosMapa.set(v.id, v);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('No se pudo cargar vehículo:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Carga de referencias para la tabla ───────────────────────────
  private cargarReferenciasPropietarios(): void {
    this.propietarioService.listar().subscribe({
      next: (data) => {
        (data ?? []).forEach(p => {
          if (p.idPropietario != null) this.propietariosMapa.set(p.idPropietario, p);
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No se pudo cargar listado de propietarios:', err)
    });
  }

  private cargarReferenciasVehiculos(): void {
    this.vehiculoService.listar().subscribe({
      next: (data) => {
        (data ?? []).forEach(v => {
          if (v.id != null) this.vehiculosMapa.set(v.id, v);
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No se pudo cargar listado de vehículos:', err)
    });
  }

  // ── Helpers para mostrar en tabla ────────────────────────────────
  obtenerNombrePropietario(id?: number): string {
    if (!id) return '-';
    const p = this.propietariosMapa.get(id);
    return p ? p.nombre : id.toString();
  }

  obtenerPlacaVehiculo(id?: number): string {
    if (!id) return '-';
    const v = this.vehiculosMapa.get(id);
    return v ? v.matricula : id.toString();
  }

  /**
   * ✅ Obtener nombre del servicio por ID
   */
  obtenerNombreServicio(id?: number): string {
    if (!id) return '-';
    const servicio = this.servicios.find(s => s.idTipoTramite === id);
    return servicio ? servicio.nombre : id.toString();
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
}
