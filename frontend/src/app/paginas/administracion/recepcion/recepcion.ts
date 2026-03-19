import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { ServicioService } from '../../../services/administracion/servicio.service';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { CertificadoRtvService } from '../../../services/operaciones/certificado-rtv.service';
import { CertificadosRegistroService } from '../../../services/operaciones/certificados-registro.service';
import { catchError, map } from 'rxjs/operators';

/* ─── Estructura real que devuelve el backend ─────────────── */
export interface TurnoRaw {
  turnoId:      number;
  propietarioId: number;
  vehiculoId:   number | null;
  servicioId:   number;
  tramiteId:    number | null;
  entidadId:    number | null;
  estado:       string;
  montoPagado:  number | null;
  fechaInicio:  string;
  fechaFin:     string | null;
  fechaCancelado: string | null;
  validador:    string | null;
}

/* ─── Turno enriquecido con datos de propietario/vehículo ── */
export interface TurnoEnriquecido extends TurnoRaw {
  propietarioNombre: string;
  vehiculoDescripcion: string;
  servicioNombre: string;
  tipoTramite: string;   // derivado del servicioId
}

const API = 'http://localhost:8080/api';

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './recepcion.html',
  styleUrl: './recepcion.css'
})
export class RecepcionComponent implements OnInit {

  turnos: TurnoEnriquecido[] = [];
  /** Para turnos EN_PROCESO: turnoId -> cantidad de métodos de inspección pendientes (0 = listo para certificado) */
  pendientesPorTurnoId: Record<number, number> = {};
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;
  private mapaServicios: Record<number, { nombre: string; tipo: string }> = {};

  constructor(
    private http: HttpClient,
    private servicioService: ServicioService,
    private turnosService: TurnosService,
    private certificadoRtvService: CertificadoRtvService,
    private certificadosRegistro: CertificadosRegistroService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.servicioService.listar().subscribe({
      next: (data) => {
        this.mapaServicios = {};
        (data ?? []).forEach(s => {
          const tipo = this.derivarTipoTramite(s.nombre);
          this.mapaServicios[s.idTipoTramite] = { nombre: s.nombre, tipo };
        });
        this.cargar();
      },
      error: () => this.cargar()
    });
  }

  private derivarTipoTramite(nombre: string): string {
    if (!nombre) return 'INSPECCION';
    const n = nombre.toUpperCase();
    if (n.includes('BLOQUEO') && !n.includes('DES')) return 'BLOQUEO';
    if (n.includes('DESBLOQUEO')) return 'DESBLOQUEO';
    if (n.includes('BAJA')) return 'BAJA';
    if (n.includes('BASE') && (n.includes('ÚNICA') || n.includes('UNICA')) && n.includes('REGIST')) return 'REGISTRO_BASE_UNICA';
    return 'INSPECCION';
  }

  /* ══════════════════════════════════════════════════════
     CARGA Y ENRIQUECIMIENTO
  ══════════════════════════════════════════════════════ */
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.turnos = [];

    this.http.get<TurnoRaw[]>(`${API}/turnos/pagados`).pipe(
      catchError(() => of([] as TurnoRaw[]))
    ).subscribe(raw => {
      // Solo turnos PAGADO (los FINALIZADOS no vuelven del backend); excluir GENERADO por si acaso
      const activos = (raw || []).filter(t =>
        (t.estado || '').toUpperCase() !== 'FINALIZADO' &&
        (t.estado || '').toUpperCase() !== 'GENERADO'
      );

      // Ordenar de mayor a menor por ID (TRN más reciente primero)
      activos.sort((a, b) => (b.turnoId ?? 0) - (a.turnoId ?? 0));

      if (activos.length === 0) {
        this.cargando = false;
        this.cdr.detectChanges();
        return;
      }

      // Obtener IDs únicos para hacer menos llamadas
      const propietarioIds = [...new Set(activos.map(t => t.propietarioId))];
      const vehiculoIds    = [...new Set(activos.map(t => t.vehiculoId).filter((x): x is number => typeof x === 'number'))];

      // Llamadas paralelas para obtener propietarios y vehículos
      const propietarios$ = forkJoin(
        propietarioIds.map(id =>
          this.http.get<any>(`${API}/propietarios/${id}`).pipe(
            catchError(() => of({ idPropietario: id, nombre: `Propietario #${id}` }))
          )
        )
      );

      const vehiculos$ = forkJoin(
        vehiculoIds.map(id =>
          this.http.get<any>(`${API}/vehiculos/${id}`).pipe(
            catchError(() => of({ id, matricula: `Vehículo #${id}` }))
          )
        )
      );

      forkJoin({ propietarios: propietarios$, vehiculos: vehiculos$ }).subscribe({
        next: ({ propietarios, vehiculos }) => {
          // Mapas para lookup rápido
          const propMap = new Map<number, any>();
          propietarios.forEach(p => {
            const id = p.idPropietario ?? p.id ?? p.propietarioId;
            propMap.set(id, p);
          });

          const vehMap = new Map<number, any>();
          vehiculos.forEach(v => {
            const id = v.id ?? v.idVehiculo ?? v.vehiculoId;
            vehMap.set(id, v);
          });

          // Enriquecer cada turno con los datos obtenidos
          this.turnos = activos.map(t => {
            const prop = propMap.get(t.propietarioId);
            const veh  = (t.vehiculoId != null) ? vehMap.get(t.vehiculoId) : null;
            const svc  = this.mapaServicios[t.servicioId];

            return {
              ...t,
              propietarioNombre:    this.extraerNombrePropietario(prop, t.propietarioId),
              vehiculoDescripcion:  this.extraerDescripcionVehiculo(veh, t.vehiculoId),
              servicioNombre:       svc?.nombre ?? `Servicio #${t.servicioId}`,
              tipoTramite:          svc?.tipo    ?? 'INSPECCION',
            };
          });

          this.pendientesPorTurnoId = {};
          const enProcesoInspeccion = this.turnos.filter(
            t => (t.estado || '').toUpperCase() === 'EN_PROCESO' && (t.tipoTramite || '') === 'INSPECCION'
          );
          if (enProcesoInspeccion.length > 0) {
            forkJoin(
              enProcesoInspeccion.map(t =>
                this.turnosService.getMetodosInspeccionPendientes(t.turnoId).pipe(
                  map(metodos => ({ turnoId: t.turnoId, count: (metodos ?? []).length })),
                  catchError(() => of({ turnoId: t.turnoId, count: -1 }))
                )
              )
            ).subscribe(res => {
              res.forEach(r => { this.pendientesPorTurnoId[r.turnoId] = r.count; });
              this.cargando = false;
              this.cdr.detectChanges();
            });
          } else {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          // Si falla el enriquecimiento, muestra con IDs
          this.turnos = activos.map(t => ({
            ...t,
            propietarioNombre:   `Propietario #${t.propietarioId}`,
            vehiculoDescripcion: `Vehículo #${t.vehiculoId}`,
            servicioNombre:      this.mapaServicios[t.servicioId]?.nombre ?? `Servicio #${t.servicioId}`,
            tipoTramite:         this.mapaServicios[t.servicioId]?.tipo ?? 'INSPECCION',
          }));
          this.pendientesPorTurnoId = {};
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  /* ─── Extrae el nombre del propietario de cualquier estructura ── */
  private extraerNombrePropietario(p: any, fallbackId: number): string {
    if (!p) return `Propietario #${fallbackId}`;
    // Intenta los campos más comunes
    const nombre  = p.nombre   ?? p.nombres   ?? p.name      ?? '';
    const apellido = p.apellido ?? p.apellidos ?? p.lastName  ?? '';
    if (nombre && apellido) return `${nombre} ${apellido}`;
    if (nombre)             return nombre;
    if (p.nombreCompleto)   return p.nombreCompleto;
    if (p.razonSocial)      return p.razonSocial;
    return `Propietario #${fallbackId}`;
  }

  /* ─── Extrae la descripción del vehículo de cualquier estructura ── */
  private extraerDescripcionVehiculo(v: any, fallbackId: number | null): string {
    if (!v) return fallbackId != null ? `Vehículo #${fallbackId}` : '-';

    const placa  = v.matricula ?? v.placa ?? '';

    // Marca: puede ser string o un objeto { descripcion, nombre }
    let marca = '';
    if (typeof v.marca === 'string')       marca = v.marca;
    else if (typeof v.marca === 'object' && v.marca)
      marca = v.marca.descripcion ?? v.marca.nombre ?? '';
    marca = marca || (v.marcaDescripcion ?? v.nombreMarca ?? '');

    // Modelo: igual
    let modelo = '';
    if (typeof v.modelo === 'string')      modelo = v.modelo;
    else if (typeof v.modelo === 'object' && v.modelo)
      modelo = v.modelo.descripcion ?? v.modelo.nombre ?? '';
    modelo = modelo || (v.modeloDescripcion ?? v.nombreModelo ?? '');

    if (marca && modelo && placa) return `${marca} ${modelo} (${placa})`;
    if (marca && modelo)          return `${marca} ${modelo}`;
    if (marca && placa)           return `${marca} (${placa})`;
    if (placa)                    return placa;
    return fallbackId != null ? `Vehículo #${fallbackId}` : '-';
  }

  /* ══════════════════════════════════════════════════════
     FILTROS Y PAGINACIÓN
  ══════════════════════════════════════════════════════ */
  get filtrados(): TurnoEnriquecido[] {
    const f = this.filtro.toLowerCase();
    if (!f) return this.turnos;
    return this.turnos.filter(t =>
      t.turnoId?.toString().includes(f) ||
      t.propietarioNombre.toLowerCase().includes(f) ||
      t.vehiculoDescripcion.toLowerCase().includes(f) ||
      t.tipoTramite.toLowerCase().includes(f) ||
      t.servicioNombre.toLowerCase().includes(f)
    );
  }

  get paginados(): TurnoEnriquecido[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina) || 1; }
  get paginas(): number[]    { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { if (p >= 1 && p <= this.totalPaginas) this.paginaActual = p; }
  onFiltroChange(): void     { this.paginaActual = 1; }

  /* ══════════════════════════════════════════════════════
     ACCIÓN BOTÓN: INICIAR PROCESO / PROCESO EN CURSO / IMPRIMIR CERTIFICADO
  ══════════════════════════════════════════════════════ */

  /** Indica si el turno está listo para imprimir certificado (EN_PROCESO + 0 métodos pendientes) */
  listoParaCertificado(t: TurnoEnriquecido): boolean {
    const est = (t.estado || '').toUpperCase();
    if (est !== 'EN_PROCESO') return false;
    if ((t.tipoTramite || '') === 'INSPECCION') {
      const pend = this.pendientesPorTurnoId[t.turnoId];
      return pend !== undefined && pend === 0;
    }
    if ((t.tipoTramite || '') === 'REGISTRO_BASE_UNICA') {
      return t.vehiculoId != null;
    }
    return false;
  }

  /** Muestra "Proceso en curso" (sin acción) cuando está EN_PROCESO pero aún hay métodos pendientes */
  enProcesoEnCurso(t: TurnoEnriquecido): boolean {
    if ((t.estado || '').toUpperCase() !== 'EN_PROCESO' || (t.tipoTramite || '') !== 'INSPECCION') return false;
    const pend = this.pendientesPorTurnoId[t.turnoId];
    return pend === undefined || pend > 0;
  }

  /** Muestra botón "Iniciar Proceso" para PAGADO/CONFIRMADO en inspección u otro trámite */
  mostrarIniciarProceso(t: TurnoEnriquecido): boolean {
    const est = (t.estado || '').toUpperCase();
    if (t.tipoTramite === 'INSPECCION') {
      return est === 'PAGADO' || est === 'CONFIRMADO';
    }
    return est === 'PAGADO' || est === 'CONFIRMADO';
  }

  iniciarProceso(t: TurnoEnriquecido): void {
    const est = (t.estado || '').toUpperCase();
    if (t.tipoTramite === 'INSPECCION' && (est === 'PAGADO' || est === 'CONFIRMADO')) {
      this.turnosService.cambiarEstado(t.turnoId, 'EN_PROCESO').subscribe({
        next: () => { this.cargar(); this.cdr.detectChanges(); },
        error: () => { this.error = 'No se pudo iniciar el proceso.'; this.cdr.detectChanges(); }
      });
      return;
    }
    if (t.tipoTramite === 'REGISTRO_BASE_UNICA' && (est === 'PAGADO' || est === 'CONFIRMADO')) {
      this.turnosService.cambiarEstado(t.turnoId, 'EN_PROCESO').subscribe({
        next: () => { this.cargar(); this.cdr.detectChanges(); },
        error: () => { this.error = 'No se pudo iniciar el proceso.'; this.cdr.detectChanges(); }
      });
      return;
    }
    const rutas: Record<string, string> = {
      'BAJA':       '/inicio/gestion_vehicular/baja-vehiculo',
      'BLOQUEO':    '/inicio/gestion_vehicular/bloqueo-vehiculo',
      'DESBLOQUEO': '/inicio/gestion_vehicular/desbloqueo-vehiculo',
      'INSPECCION': '/inicio/inspeccion-rtv/turnos-pagados',
      'REGISTRO_BASE_UNICA': '/inicio/gestion_vehicular/vehiculo',
    };
    const ruta = rutas[t.tipoTramite] ?? '/inicio/inspeccion-rtv/turnos-pagados';
    this.router.navigate([ruta], {
      queryParams: t.tipoTramite === 'INSPECCION' ? {
        turnoId: t.turnoId, tramiteId: t.tramiteId ?? '', vehiculoId: t.vehiculoId,
        propietarioId: t.propietarioId, servicioId: t.servicioId,
        numeroTurno: `TRN-${t.turnoId}`, fromRecepcion: 'true'
      } : (t.tipoTramite === 'REGISTRO_BASE_UNICA' ? { turnoId: t.turnoId } : {})
    });
  }

  imprimirCertificado(t: TurnoEnriquecido): void {
    if ((t.tipoTramite || '') === 'REGISTRO_BASE_UNICA') {
      this.certificadosRegistro.mostrarParaTurno(t.turnoId, () => {
        this.turnosService.cambiarEstado(t.turnoId, 'FINALIZADO').subscribe({
          next: () => { this.cargar(); this.cdr.detectChanges(); },
          error: () => { this.error = 'No se pudo finalizar el turno.'; this.cdr.detectChanges(); }
        });
      });
      return;
    }
    this.certificadoRtvService.mostrar(t.turnoId, () => {
      this.turnosService.cambiarEstado(t.turnoId, 'FINALIZADO').subscribe({
        next: () => { this.cargar(); this.cdr.detectChanges(); },
        error: () => { this.error = 'No se pudo finalizar el turno.'; this.cdr.detectChanges(); }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════════════ */
  getTramiteIcon(tipo: string): string {
    if (tipo === 'BAJA')       return 'remove_circle';
    if (tipo === 'DESBLOQUEO') return 'lock_open';
    if (tipo === 'BLOQUEO')    return 'lock';
    return 'fact_check';
  }

  getTramiteClass(tipo: string): string {
    if (tipo === 'BAJA')       return 'tipo-baja';
    if (tipo === 'DESBLOQUEO') return 'tipo-desbloqueo';
    if (tipo === 'BLOQUEO')    return 'tipo-bloqueo';
    return 'tipo-inspeccion';
  }

  getEstadoBadge(estado: string): string {
    if (estado === 'PAGADO')     return 'badge-pagado';
    if (estado === 'EN_PROCESO') return 'badge-proceso';
    if (estado === 'FINALIZADO') return 'badge-finalizado';
    return 'badge-pagado';
  }
}
