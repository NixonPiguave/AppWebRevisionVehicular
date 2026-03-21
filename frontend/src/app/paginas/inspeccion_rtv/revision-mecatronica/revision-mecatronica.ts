import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EquiposService, Equipo } from '../../../services/inspeccion_rtv/equipos.service';
import { InspeccionService } from '../../../services/inspeccion_rtv/inspeccion.service';
import {
  esEquipoMecatronica,
  parametrosQueInfluenciaEquipo,
  generarValoresAleatoriosMecatronica
} from '../../../utils/equipo-categoria.util';
import { TurnosService } from '../../../services/administracion/Turnos.service';
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
  /** Equipo seleccionado por grupo. null = manual */
  equipoFrenosId: number | null = null;
  equipoSuspensionId: number | null = null;
  equipoAlineacionId: number | null = null;

  get esMoto(): boolean {
    return this.lineaIdParam === this.LINEA_MOTOS_ID;
  }

  /** Equipos que influyen en frenos */
  get equiposFrenos(): Equipo[] {
    return this.equipos.filter(e => parametrosQueInfluenciaEquipo(e.equipo || '').includes('frenos'));
  }
  /** Equipos que influyen en suspensión */
  get equiposSuspension(): Equipo[] {
    return this.equipos.filter(e => parametrosQueInfluenciaEquipo(e.equipo || '').includes('suspension'));
  }
  /** Equipos que influyen en alineación */
  get equiposAlineacion(): Equipo[] {
    return this.equipos.filter(e => parametrosQueInfluenciaEquipo(e.equipo || '').includes('alineacion'));
  }

  /** Grupos con influencia=1: inputs read-only */
  get frenosSoloLectura(): boolean {
    const eq = this.equipoFrenosId ? this.equipos.find(e => (e.equipoid ?? 0) === this.equipoFrenosId) : null;
    return eq != null && eq.influencia === 1;
  }
  get suspensionSoloLectura(): boolean {
    const eq = this.equipoSuspensionId ? this.equipos.find(e => (e.equipoid ?? 0) === this.equipoSuspensionId) : null;
    return eq != null && eq.influencia === 1;
  }
  get alineacionSoloLectura(): boolean {
    const eq = this.equipoAlineacionId ? this.equipos.find(e => (e.equipoid ?? 0) === this.equipoAlineacionId) : null;
    return eq != null && eq.influencia === 1;
  }

  // Parámetros (Carros y Motos — misma lógica)
  frenosEficacia = '';
  frenosDesequilibrio = '';
  suspensionEficacia = '';
  suspensionDesequilibrio = '';
  alineacionConvergencia = '';
  alineacionDivergencia = '';
  amortiguadoresOk = true;

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
      equipos: this.equiposService.listarEquipos()
    };
    if (this.turnoId) {
      obs.turno = this.turnosService.getById(this.turnoId);
    }
    forkJoin(obs).subscribe({
      next: (res: any) => {
        const todos = res.equipos || [];
        this.equipos = todos.filter((e: Equipo) => esEquipoMecatronica(e.equipo || ''));
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

  /** Al cambiar equipo de un grupo: si influencia=1, auto-llenar y read-only */
  onEquipoFrenosChange(equipoId: number | null | string): void {
    this.equipoFrenosId = equipoId == null || equipoId === '' ? null : Number(equipoId);
    const id = this.equipoFrenosId;
    if (id) {
      const eq = this.equipos.find(e => (e.equipoid ?? 0) === id);
      if (eq && eq.influencia === 1) {
        this.leerDatosFrenos();
      }
    }
    this.cdr.detectChanges();
  }
  onEquipoSuspensionChange(equipoId: number | null | string): void {
    this.equipoSuspensionId = equipoId == null || equipoId === '' ? null : Number(equipoId);
    const id = this.equipoSuspensionId;
    if (id) {
      const eq = this.equipos.find(e => (e.equipoid ?? 0) === id);
      if (eq && eq.influencia === 1) {
        this.leerDatosSuspension();
      }
    }
    this.cdr.detectChanges();
  }
  onEquipoAlineacionChange(equipoId: number | null | string): void {
    this.equipoAlineacionId = equipoId == null || equipoId === '' ? null : Number(equipoId);
    const id = this.equipoAlineacionId;
    if (id) {
      const eq = this.equipos.find(e => (e.equipoid ?? 0) === id);
      if (eq && eq.influencia === 1) {
        this.leerDatosAlineacion();
      }
    }
    this.cdr.detectChanges();
  }

  /** Botón "Leer datos" para grupos manuales */
  leerDatosFrenos(): void {
    const vals = generarValoresAleatoriosMecatronica(['frenos']);
    if (vals.frenosEficacia != null) this.frenosEficacia = String(vals.frenosEficacia);
    if (vals.frenosDesequilibrio != null) this.frenosDesequilibrio = String(vals.frenosDesequilibrio);
    this.cdr.detectChanges();
  }
  leerDatosSuspension(): void {
    const vals = generarValoresAleatoriosMecatronica(['suspension']);
    if (vals.suspensionEficacia != null) this.suspensionEficacia = String(vals.suspensionEficacia);
    if (vals.suspensionDesequilibrio != null) this.suspensionDesequilibrio = String(vals.suspensionDesequilibrio);
    this.cdr.detectChanges();
  }
  leerDatosAlineacion(): void {
    const vals = generarValoresAleatoriosMecatronica(['alineacion']);
    if (vals.alineacionConvergencia != null) this.alineacionConvergencia = String(vals.alineacionConvergencia);
    if (vals.alineacionDivergencia != null) this.alineacionDivergencia = String(vals.alineacionDivergencia);
    this.cdr.detectChanges();
  }

  guardarInspeccion(): void {
    if (!this.vehiculoId || !this.metodoInspeccionId) {
      this.notification.error('Faltan datos del turno o vehículo.');
      return;
    }
    // Validar rangos antes de enviar (0-100 para eficacia/desequilibrio)
    const fe = parseFloat(this.frenosEficacia);
    const fd = parseFloat(this.frenosDesequilibrio);
    const se = parseFloat(this.suspensionEficacia);
    const sd = parseFloat(this.suspensionDesequilibrio);
    if (!isNaN(fe) && (fe < 0 || fe > 100)) {
      this.notification.error('Eficacia de frenos debe estar entre 0 y 100.');
      return;
    }
    if (!isNaN(fd) && (fd < 0 || fd > 100)) {
      this.notification.error('Desequilibrio de frenos debe estar entre 0 y 100.');
      return;
    }
    if (!isNaN(se) && (se < 0 || se > 100)) {
      this.notification.error('Eficacia de suspensión debe estar entre 0 y 100.');
      return;
    }
    if (!isNaN(sd) && (sd < 0 || sd > 100)) {
      this.notification.error('Desequilibrio de suspensión debe estar entre 0 y 100.');
      return;
    }
    const usuarioId = Number(this.authService.getUsuarioId() ?? 0);
    if (!usuarioId || Number.isNaN(usuarioId)) {
      this.notification.error('No se pudo obtener el usuario logueado. Vuelva a iniciar sesión.');
      return;
    }
    const eqNombresSet = new Set<string>();
    const addEq = (id: number | null) => {
      if (id) {
        const n = this.equipos.find(e => (e.equipoid ?? 0) === id)?.equipo;
        if (n) eqNombresSet.add(n);
      }
    };
    addEq(this.equipoFrenosId);
    addEq(this.equipoSuspensionId);
    addEq(this.equipoAlineacionId);
    const eqNombres = Array.from(eqNombresSet);
    const obs = [
      `Frenos eficacia: ${this.frenosEficacia || 'N/A'}%, desequilibrio: ${this.frenosDesequilibrio || 'N/A'}%`,
      `Suspensión eficacia: ${this.suspensionEficacia || 'N/A'}%, desequilibrio: ${this.suspensionDesequilibrio || 'N/A'}%`,
      `Alineación conv: ${this.alineacionConvergencia || 'N/A'} div: ${this.alineacionDivergencia || 'N/A'}`,
      `Amortiguadores: ${this.amortiguadoresOk ? 'OK' : 'Con fugas'}`,
      eqNombres.length ? `Equipos: ${eqNombres.join(', ')}` : ''
    ].filter(Boolean).join('. ');
    const observacionesCompletas = [obs, this.observaciones].filter(Boolean).join(' | ');

    const equiposIds = [
      this.equipoFrenosId,
      this.equipoSuspensionId,
      this.equipoAlineacionId
    ].filter((id): id is number => id != null && id > 0);

    const valoresMedidos: Record<string, number> = {};
    if (!isNaN(fe)) valoresMedidos['FRENOS_EFICACIA'] = fe;
    if (!isNaN(fd)) valoresMedidos['FRENOS_DESEQUILIBRIO'] = fd;
    if (!isNaN(se)) valoresMedidos['SUSPENSION_EFICACIA'] = se;
    if (!isNaN(sd)) valoresMedidos['SUSPENSION_DESEQUILIBRIO'] = sd;
    const ac = parseFloat(this.alineacionConvergencia);
    if (!isNaN(ac)) valoresMedidos['ALINEACION_CONVERGENCIA'] = ac;
    const ad = parseFloat(this.alineacionDivergencia);
    if (!isNaN(ad)) valoresMedidos['ALINEACION_DIVERGENCIA'] = ad;

    const payload = {
      vehiculoId: this.vehiculoId,
      metodoInspeccionId: this.metodoInspeccionId,
      lineaId: this.lineaIdParam ?? 1,
      usuarioId,
      observaciones: observacionesCompletas,
      defectosIds: [] as number[],
      equiposIds: equiposIds.length > 0 ? [...new Set(equiposIds)] : undefined,
      valoresMedidos: Object.keys(valoresMedidos).length > 0 ? valoresMedidos : undefined
    };

    this.guardando = true;
    this.inspeccionService.crear(payload).subscribe({
      next: (resp: any) => {
        this.guardando = false;
        const res = resp?.resultado ?? resp?.data?.resultado ?? 'APROBADO';
        this.notification.success(`Revisión mecatrónica registrada. Resultado: ${res}`);
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
