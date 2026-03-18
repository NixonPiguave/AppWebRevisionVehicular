import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EquiposService, Equipo } from '../../../services/inspeccion_rtv/equipos.service';
import { InspeccionService } from '../../../services/inspeccion_rtv/inspeccion.service';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { DefectosService, Defectos } from '../../../services/defectos_inspeccion/defectos.service';
import { VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';

/**
 * Revisión Mecatrónica - Normativa RTV Ecuador (Res. 025-ANT, RTE INEN 034)
 * Segunda sección: Frenos, Suspensión y Alineación
 */
@Component({
  selector: 'app-revision-mecatronica',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './revision-mecatronica.html',
  styleUrl: './revision-mecatronica.css',
})
export class RevisionMecatronica implements OnInit {

  /** Línea Motos = 1, Carros = 2 (según orden en BD) */
  readonly LINEA_MOTOS_ID = 1;

  turnoId: number | null = null;
  vehiculoId: number | null = null;
  metodoInspeccionId: number | null = null;
  lineaIdParam: number | null = null;
  vehiculoInfo: { matricula?: string; marca?: string; modelo?: string } | null = null;

  equipos: Equipo[] = [];
  equiposSeleccionados: number[] = [];
  defectos: Defectos[] = [];
  defectosSeleccionados: Defectos[] = [];
  filtroDefectos = '';

  get esMoto(): boolean {
    return this.lineaIdParam === this.LINEA_MOTOS_ID;
  }

  // Parámetros CARROS (normativa RTV Ecuador)
  frenosEficacia = '';
  frenosDesequilibrio = '';
  suspensionEficacia = '';
  suspensionDesequilibrio = '';
  alineacionConvergencia = '';
  alineacionDivergencia = '';
  amortiguadoresOk = true;

  // Parámetros MOTOS (RTV Ecuador: pastillas, zapatas, líquido, amortiguadores)
  frenosPastillasOk = true;
  frenosZapatasOk = true;
  frenosLiquidoOk = true;
  amortiguadoresMotoOk = true;
  alineacionMotoOk = true;  // Dirección / alineación (opcional)

  resultado: 'APROBADO' | 'NO_APROBADO' = 'APROBADO';
  observaciones = '';

  cargando = false;
  guardando = false;
  error = '';

  private turnoConfirmadoIntentado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private equiposService: EquiposService,
    private inspeccionService: InspeccionService,
    private turnosService: TurnosService,
    private defectosService: DefectosService,
    private vehiculoService: VehiculoService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
      this.vehiculoId = params['vehiculoId'] ? +params['vehiculoId'] : null;
      this.metodoInspeccionId = params['metodoInspeccionId'] ? +params['metodoInspeccionId'] : null;
      this.lineaIdParam = params['lineaId'] ? +params['lineaId'] : null;
    });
    if (this.turnoId || this.vehiculoId) {
      setTimeout(() => {
        this.confirmarTurnoDesdeApi();
        this.cargarDatos();
      }, 200);
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    const obs: any = {
      equipos: this.equiposService.listarEquipos(),
      defectos: this.defectosService.listar()
    };
    if (this.turnoId) {
      obs.turno = this.turnosService.getById(this.turnoId);
    }
    forkJoin(obs).subscribe({
      next: (res: any) => {
        this.equipos = res.equipos || [];
        this.defectos = res.defectos || [];
        if (res.turno) {
          this.confirmarTurnoSiAplica(res.turno);
          const vid = (res.turno as any).vehiculoId ?? (res.turno as any).vehiculo?.id;
          this.vehiculoId = vid ? Number(vid) : this.vehiculoId;
        }
        if (this.vehiculoId) this.cargarVehiculoInfo(this.vehiculoId);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = 'Error al cargar datos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Al entrar a una revisión, si el turno está PAGADO lo pasamos a CONFIRMADO */
  private confirmarTurnoSiAplica(turno: any): void {
    const id = this.turnoId ?? turno?.turnoId ?? turno?.id;
    if (!id) return;
    const estado = String(turno?.estado || '').toUpperCase();
    if (estado !== 'PAGADO') return;

    this.turnosService.cambiarEstado(Number(id), 'CONFIRMADO').subscribe({
      next: () => console.log('[RTV] Turno confirmado:', id),
      error: (e) => console.warn('[RTV] No se pudo confirmar el turno:', id, e)
    });
  }

  /** Respaldo: confirma el turno consultándolo por turnoId (aunque no venga en forkJoin) */
  private confirmarTurnoDesdeApi(): void {
    if (this.turnoConfirmadoIntentado) return;
    if (!this.turnoId) return;
    this.turnoConfirmadoIntentado = true;

    this.turnosService.getById(this.turnoId).subscribe({
      next: (t: any) => this.confirmarTurnoSiAplica(t),
      error: (e) => console.warn('[RTV] No se pudo consultar el turno para confirmar:', this.turnoId, e)
    });
  }

  cargarVehiculoInfo(id: number): void {
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v: any) => {
        this.vehiculoInfo = {
          matricula: v.matricula || v.placa || `Veh #${id}`,
          marca: v.marcaNombre || v.marca?.nombre || v.marca || '',
          modelo: v.modeloNombre || v.modelo?.nombre || v.modelo || ''
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.vehiculoInfo = { matricula: `Veh #${id}` };
        this.cdr.detectChanges();
      }
    });
  }

  toggleEquipo(id: number): void {
    const idx = this.equiposSeleccionados.indexOf(id);
    if (idx >= 0) this.equiposSeleccionados.splice(idx, 1);
    else this.equiposSeleccionados.push(id);
  }

  toggleDefecto(d: Defectos): void {
    const idx = this.defectosSeleccionados.findIndex(x => x.id === d.id);
    if (idx >= 0) this.defectosSeleccionados.splice(idx, 1);
    else this.defectosSeleccionados.push(d);
  }

  estaDefectoSeleccionado(id: number | null): boolean {
    return id != null && this.defectosSeleccionados.some(d => d.id === id);
  }

  get defectosFiltrados(): Defectos[] {
    const f = (this.filtroDefectos || '').toLowerCase();
    if (!f) return this.defectos;
    return this.defectos.filter(d =>
      (d.codigo || '').toLowerCase().includes(f) ||
      (d.descripcion || '').toLowerCase().includes(f) ||
      (d.puntoDeTrabajo || '').toLowerCase().includes(f)
    );
  }

  guardarInspeccion(): void {
    if (!this.vehiculoId || !this.metodoInspeccionId) {
      this.notification.error('Faltan datos del turno o vehículo.');
      return;
    }

    const usuarioId = Number(this.authService.getUsuarioId() ?? 0);
    if (!usuarioId || Number.isNaN(usuarioId)) {
      this.notification.error('No se pudo obtener el usuario logueado. Vuelva a iniciar sesión.');
      return;
    }
    const eqNombres = this.equiposSeleccionados
      .map(id => this.equipos.find(e => (e.equipoid ?? 0) === id)?.equipo)
      .filter(Boolean);
    const obs = this.esMoto
      ? [
          `Frenos: pastillas ${this.frenosPastillasOk ? 'OK' : 'defecto'}, zapatas ${this.frenosZapatasOk ? 'OK' : 'defecto'}, líquido ${this.frenosLiquidoOk ? 'OK' : 'defecto'}`,
          `Amortiguadores: ${this.amortiguadoresMotoOk ? 'sin fugas' : 'con fugas'}`,
          `Alineación/dirección: ${this.alineacionMotoOk ? 'OK' : 'defecto'}`,
          eqNombres.length ? `Equipos: ${eqNombres.join(', ')}` : ''
        ].filter(Boolean).join('. ')
      : [
          `Frenos eficacia: ${this.frenosEficacia || 'N/A'}%, desequilibrio: ${this.frenosDesequilibrio || 'N/A'}%`,
          `Suspensión eficacia: ${this.suspensionEficacia || 'N/A'}%, desequilibrio: ${this.suspensionDesequilibrio || 'N/A'}%`,
          `Alineación conv: ${this.alineacionConvergencia || 'N/A'} div: ${this.alineacionDivergencia || 'N/A'}`,
          `Amortiguadores: ${this.amortiguadoresOk ? 'OK' : 'Con fugas'}`,
          eqNombres.length ? `Equipos: ${eqNombres.join(', ')}` : ''
        ].filter(Boolean).join('. ');
    const observacionesCompletas = [obs, this.observaciones].filter(Boolean).join(' | ');

    const defectosIds = this.resultado === 'NO_APROBADO' && this.defectosSeleccionados.length > 0
      ? this.defectosSeleccionados.map(d => d.id!).filter(id => id > 0)
      : [];

    const valoresMedidos: Record<string, number> = {};
    if (!this.esMoto) {
      const fe = parseFloat(this.frenosEficacia);
      if (!isNaN(fe)) valoresMedidos['FRENOS_EFICACIA'] = fe;
      const se = parseFloat(this.suspensionEficacia);
      if (!isNaN(se)) valoresMedidos['SUSPENSION_EFICACIA'] = se;
    }

    const payload = {
      vehiculoId: this.vehiculoId,
      metodoInspeccionId: this.metodoInspeccionId,
      lineaId: this.lineaIdParam ?? 1,
      usuarioId,
      observaciones: observacionesCompletas,
      defectosIds,
      valoresMedidos: Object.keys(valoresMedidos).length > 0 ? valoresMedidos : undefined
    };

    this.guardando = true;
    this.inspeccionService.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success('Revisión mecatrónica registrada.');
        this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
        this.cdr.detectChanges();
      },
      error: err => {
        this.guardando = false;
        this.notification.error(err?.error?.message || 'Error al guardar.');
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
  }
}
