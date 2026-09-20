import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VehiclePhotoComponent } from '../../../components/vehicle-photo/vehicle-photo';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import { LineasService, Linea } from '../../../services/inspeccion_rtv/lineas.service';
import { NotificationService } from '../../../services/notification.service';
import { PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { VehiculoService, Vehiculo } from '../../../services/gestion_vehicular/vehiculo.service';
import { obtenerRutaPorMetodo } from '../../../config/metodo-inspeccion-routes.config';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-turnos-pagados',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, VehiclePhotoComponent],
  templateUrl: './turnos-pagados.html',
  styleUrl: './turnos-pagados.css',
})
export class TurnosPagadosComponent implements OnInit {
  private fotosVehiculos = new Map<number, string>();
  fotoVehiculo(turno: Turnos): string | undefined {
    return this.fotosVehiculos.get(turno.vehiculoId ?? -1);
  }
  busqueda = '';
  pagina = 1;
  readonly porPagina = 10;
  serviciosCargados = false;
  errorServicios = '';
  errorMetodos = '';
  private solicitudMetodos = 0;

  get turnosFiltrados(): Turnos[] {
    const normalizar = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const query = normalizar(this.busqueda.trim());
    return this.turnos.filter((t) =>
      normalizar(
        `${t.turnoId} ${t.vehiculoDescripcion ?? ''} ${t.propietarioNombre ?? ''} ${this.getNombreServicio(t.servicioId)}`,
      ).includes(query),
    );
  }
  get turnosPagina(): Turnos[] {
    return this.turnosFiltrados.slice(
      (this.pagina - 1) * this.porPagina,
      this.pagina * this.porPagina,
    );
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.turnosFiltrados.length / this.porPagina));
  }
  @HostListener('document:keydown.escape') cerrarConEscape(): void {
    if (this.mostrarModal) this.cerrarModal();
  }

  turnos: Turnos[] = [];
  cargando = false;
  error = '';

  lineas: Linea[] = [];
  lineaSeleccionada: Linea | null = null;
  cargandoLineas = false;
  errorLineas = '';

  mostrarModal = false;
  turnoSeleccionado: Turnos | null = null;
  metodosPendientes: { id: number; nombre: string }[] = [];
  cargandoMetodos = false;

  servicios: Servicio[] = [];
  private tipoTramitePorServicioId = new Map<number, string>();

  constructor(
    private turnosService: TurnosService,
    private servicioService: ServicioService,
    private propietarioService: PropietarioService,
    private vehiculoService: VehiculoService,
    private lineasService: LineasService,
    private router: Router,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarLineas();
  }

  cargarServicios(): void {
    this.errorServicios = '';
    this.serviciosCargados = false;
    this.servicioService.listar().subscribe({
      next: (data) => {
        this.servicios = data ?? [];
        this.tipoTramitePorServicioId = new Map(
          (this.servicios ?? []).map((s) => [
            s.idTipoTramite,
            this.clasificarServicioInspeccion(s),
          ]),
        );
        this.serviciosCargados = true;
        if (this.lineaSeleccionada) this.cargarTurnosPagados();
        this.cdr.detectChanges();
      },
      error: () => {
        this.servicios = [];
        this.errorServicios =
          'No se pudo cargar el catálogo de servicios. Reintenta para consultar la cola.';
        this.tipoTramitePorServicioId = new Map();
        this.cdr.detectChanges();
      },
    });
  }

  cargarLineas(): void {
    this.cargandoLineas = true;
    this.errorLineas = '';
    this.lineasService.listarRoles().subscribe({
      next: (data) => {
        this.lineas = data ?? [];
        this.cargandoLineas = false;
        const recordada = Number(sessionStorage.getItem('rtv.lineaInspeccion'));
        const inicial = this.lineas.find((linea) => linea.id === recordada) ?? this.lineas[0];
        if (inicial) this.seleccionarLinea(inicial);
        this.cdr.detectChanges();
      },
      error: () => {
        this.lineas = [];
        this.errorLineas = 'No se pudieron cargar las líneas de inspección. Intente nuevamente.';
        this.cargandoLineas = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarLinea(linea: Linea): void {
    if (this.cargando) return;
    this.pagina = 1;
    this.cerrarModal();
    this.lineaSeleccionada = linea;
    sessionStorage.setItem('rtv.lineaInspeccion', String(linea.id));
    if (this.serviciosCargados) this.cargarTurnosPagados();
    this.cdr.detectChanges();
  }

  cargarTurnosPagados(): void {
    if (this.cargando || !this.serviciosCargados) return;
    this.pagina = 1;
    if (!this.lineaSeleccionada?.id) {
      this.turnos = [];
      this.cdr.detectChanges();
      return;
    }
    this.cargando = true;
    this.error = '';
    this.turnos = [];
    this.fotosVehiculos.clear();
    this.cerrarModal();
    this.turnosService.getPagados(undefined, this.lineaSeleccionada.id).subscribe({
      next: (data: Turnos[]) => {
        const lista = data ?? [];

        // Requisito: el inspector SOLO debe ver turnos con proceso en curso.
        const activos = lista.filter((t) => {
          if ((t.estado || '').trim().toUpperCase() !== 'EN_PROCESO') return false;
          const s = this.servicios.find((x) => x.idTipoTramite === t.servicioId);
          if (s && this.servicioExcluidoDeInspeccionPorFlag(s)) return false;
          const tipo =
            this.tipoTramitePorServicioId.get(t.servicioId) ??
            (s
              ? this.clasificarServicioInspeccion(s)
              : this.derivarTipoTramite(this.getNombreServicio(t.servicioId)));
          return tipo === 'INSPECCION';
        });

        if (activos.length === 0) {
          this.turnos = [];
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        // Enriquecer con nombre de propietario y marca/modelo del vehículo
        const propietarioIds = [...new Set(activos.map((t) => t.propietarioId))];
        const vehiculoIds = [
          ...new Set(
            activos.map((t) => t.vehiculoId).filter((x): x is number => typeof x === 'number'),
          ),
        ];

        const propietarios$ = propietarioIds.length
          ? forkJoin(
              propietarioIds.map((id) =>
                this.propietarioService
                  .obtenerPorId(id)
                  .pipe(
                    catchError(() =>
                      of({ idPropietario: id, nombre: `Propietario #${id}` } as any),
                    ),
                  ),
              ),
            )
          : of([]);

        const vehiculos$ = vehiculoIds.length
          ? forkJoin(
              vehiculoIds.map((id) =>
                this.vehiculoService
                  .obtenerPorId(id)
                  .pipe(catchError(() => of({ id, matricula: `Vehículo #${id}` } as any))),
              ),
            )
          : of([]);

        forkJoin({ propietarios: propietarios$, vehiculos: vehiculos$ }).subscribe({
          next: ({ propietarios, vehiculos }) => {
            const propMap = new Map<number, string>();
            propietarios.forEach((p: any) => {
              const id = p?.idPropietario ?? p?.id ?? p?.propietarioId;
              if (typeof id === 'number') propMap.set(id, p?.nombre ?? `Propietario #${id}`);
            });

            const vehMap = new Map<number, string>();
            vehiculos.forEach((v: any) => {
              const id = v?.id ?? v?.vehiculoId ?? v?.idVehiculo;
              if (typeof id === 'number' && v.fotoUrl) this.fotosVehiculos.set(id, v.fotoUrl);
              if (typeof id === 'number') vehMap.set(id, this.construirVehiculoDescripcion(v, id));
            });

            const enriquecidos: Turnos[] = activos.map((t) => ({
              ...t,
              propietarioNombre: propMap.get(t.propietarioId),
              vehiculoDescripcion: t.vehiculoId != null ? vehMap.get(t.vehiculoId) : '-',
            }));

            this.filtrarPorMetodosInspeccionPendientes(enriquecidos);
          },
          error: (err) => {
            console.error('Error al enriquecer propietarios/vehículos:', err);
            // Fallback: al menos respetar el filtro EN_PROCESO
            this.filtrarPorMetodosInspeccionPendientes(activos);
          },
        });
      },
      error: (err) => {
        console.error('Error al cargar turnos pagados:', err);
        this.error = 'No se pudieron cargar los turnos pagados.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private filtrarPorMetodosInspeccionPendientes(lista: Turnos[]): void {
    // Ocultar turnos que ya NO tienen métodos pendientes (ya se hicieron las 3 inspecciones)
    forkJoin(
      lista.map((t) =>
        this.turnosService.getMetodosInspeccionPendientes(t.turnoId as number).pipe(
          map((metodos) => ({ turno: t, pendientes: metodos ?? [] })),
          // Si falla la consulta, NO ocultamos el turno (mejor mostrarlo que perderlo)
          catchError(() => of({ turno: t, pendientes: [{ id: -1, nombre: '__error__' }] })),
        ),
      ),
    ).subscribe({
      next: (res) => {
        this.turnos = res.filter((x) => (x.pendientes?.length ?? 0) > 0).map((x) => x.turno);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error filtrando turnos por métodos pendientes:', err);
        // Fallback: mostrar sin filtrar
        this.turnos = lista;
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  getNombreServicio(servicioId: number): string {
    const s = this.servicios.find((x) => x.idTipoTramite === servicioId);
    return s?.nombre ?? `Servicio #${servicioId}`;
  }

  /**
   * Clasifica el trámite para la cola "Iniciar inspección".
   * Solo INSPECCION debe listarse aquí (emisión matrícula, RTV, etc.).
   * Transferencia de dominio y similares van a OTRO.
   */
  private clasificarServicioInspeccion(s: Servicio): string {
    return this.derivarTipoTramite(s.nombre, s.requiereRevision);
  }

  /** Si el catálogo marca explícitamente que no requiere revisión RTV. */
  private servicioExcluidoDeInspeccionPorFlag(s: Servicio): boolean {
    const rr = (s.requiereRevision ?? '').toString().trim().toUpperCase();
    return rr === 'N' || rr === 'NO' || rr === 'FALSE' || rr === '0';
  }

  private derivarTipoTramite(nombre?: string, requiereRevision?: string | boolean): string {
    const rr = (requiereRevision ?? '').toString().trim().toUpperCase();
    if (rr === 'N' || rr === 'NO' || rr === 'FALSE' || rr === '0') {
      return 'OTRO';
    }
    if (!nombre) return 'INSPECCION';
    const n = nombre.toUpperCase();
    // Trámites legales / gestión que no pasan por línea de inspección RTV
    const esTransferenciaDominio =
      n.includes('DOMINIO') &&
      (n.includes('TRANSFERENCIA') || n.includes('TRASPASO') || n.includes('TRASPAS'));
    if (esTransferenciaDominio) return 'OTRO';
    if (n.includes('BLOQUEO') && !n.includes('DES')) return 'BLOQUEO';
    if (n.includes('DESBLOQUEO')) return 'DESBLOQUEO';
    if (n.includes('BAJA')) return 'BAJA';
    return 'INSPECCION';
  }

  getEstadoLabel(estado?: string): string {
    return (estado || '').replace(/_/g, ' ');
  }

  getEstadoBadge(estado?: string): string {
    const e = (estado || '').toUpperCase();
    if (e === 'PAGADO') return 'badge-pagado';
    if (e === 'EN_PROCESO') return 'badge-proceso';
    if (e === 'CONFIRMADO') return 'badge-confirmado';
    if (e === 'CANCELADO') return 'badge-cancelado';
    return 'badge-pagado';
  }

  private construirVehiculoDescripcion(veh: Vehiculo | any, fallbackId: number): string {
    if (!veh) return `Vehículo #${fallbackId}`;

    const marca = veh.marcaNombre ?? '';
    const modelo = veh.modeloNombre ?? '';
    const placa = veh.matricula ?? '';
    const anio = veh.anioFabricacion ?? undefined;

    let base = '';
    if (marca && modelo) base = `${marca} ${modelo}`;
    else if (marca) base = marca;
    else if (modelo) base = modelo;

    if (!base) base = `Vehículo #${fallbackId}`;
    if (anio != null && anio !== undefined) base = `${base} (${anio})`;
    if (placa) base = `${base} (${placa})`;
    return base;
  }

  abrirModalMetodos(turno: Turnos): void {
    const solicitud = ++this.solicitudMetodos;
    this.errorMetodos = '';
    const vehiculoId = (turno as any).vehiculoId ?? (turno as any).vehiculo?.id;
    if (!turno.turnoId || !vehiculoId) {
      this.notification.error('Este turno no tiene vehículo asociado.');
      return;
    }
    this.turnoSeleccionado = turno;
    this.mostrarModal = true;
    this.metodosPendientes = [];
    this.cargandoMetodos = true;
    this.turnosService.getMetodosInspeccionPendientes(turno.turnoId!).subscribe({
      next: (metodos) => {
        if (solicitud !== this.solicitudMetodos) return;
        this.metodosPendientes = metodos;
        this.cargandoMetodos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (solicitud !== this.solicitudMetodos) return;
        this.errorMetodos = 'No se pudieron consultar las revisiones pendientes.';
        console.error('Error al cargar métodos pendientes:', err);
        this.notification.error('No se pudieron cargar los métodos de inspección pendientes.');
        this.cargandoMetodos = false;
        this.cdr.detectChanges();
      },
    });
  }

  cerrarModal(): void {
    this.solicitudMetodos++;
    this.mostrarModal = false;
    this.turnoSeleccionado = null;
    this.metodosPendientes = [];
  }

  seleccionarMetodo(metodo: { id: number; nombre: string }): void {
    if (!this.turnoSeleccionado) return;
    const vehiculoId =
      (this.turnoSeleccionado as any).vehiculoId ?? (this.turnoSeleccionado as any).vehiculo?.id;
    const turnoId = this.turnoSeleccionado.turnoId;
    const lineaId = this.lineaSeleccionada?.id;

    const ruta = obtenerRutaPorMetodo(metodo.nombre) ?? '/inicio/inspeccion-rtv/registrar';

    this.cerrarModal();

    const params = new URLSearchParams({
      turnoId: String(turnoId),
      vehiculoId: String(vehiculoId),
      metodoInspeccionId: String(metodo.id),
    });
    if (lineaId != null) params.set('lineaId', String(lineaId));
    this.router.navigateByUrl(`${ruta}?${params.toString()}`);
  }

  volver(): void {
    this.router.navigate(['/inicio']);
  }
}
