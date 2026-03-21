import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InspeccionService } from '../../../services/inspeccion_rtv/inspeccion.service';
import { ValoresgasesService } from '../../../services/inspeccion_rtv/valoresgases.service';
import { EquiposService, Equipo } from '../../../services/inspeccion_rtv/equipos.service';
import { esEquipoGases, esEquipoAnalizadorGases, esEquipoOpacimetro } from '../../../utils/equipo-categoria.util';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-revision-gases',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './revision-gases.html',
  styleUrl: './revision-gases.css',
})
export class RevisionGases implements OnInit {


  readonly LINEA_MOTOS_ID = 1;

  turnoId: number | null = null;
  vehiculoId: number | null = null;
  metodoInspeccionId: number | null = null;
  lineaIdParam: number | null = null;
  vehiculoInfo: { matricula?: string; marca?: string; modelo?: string } | null = null;

  equipos: Equipo[] = [];
  /** Un solo equipo por inspección (analizador u opacímetro según combustible) */
  equipoSeleccionadoId: number | null = null;

  get esMoto(): boolean {
    return this.lineaIdParam === this.LINEA_MOTOS_ID;
  }

  /** Equipos filtrados según combustible: gasolina/motos = analizadores; diesel = opacímetros */
  get equiposFiltrados(): Equipo[] {
    const todos = this.equipos;
    if (this.tipoCombustible === 'DIESEL') {
      return todos.filter(e => esEquipoOpacimetro(e.equipo || ''));
    }
    return todos.filter(e => esEquipoAnalizadorGases(e.equipo || ''));
  }

  tipoCombustible: 'GASOLINA' | 'DIESEL' = 'GASOLINA';
  co = '';
  hc = '';
  lambda = '';
  o2 = '';
  opacidad = '';
  observaciones = '';
  kilometraje: number | null = null;

  cargando = false;
  guardando = false;
  rellenando = false;
  error = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private inspeccionService: InspeccionService,
    private valoresGasesService: ValoresgasesService,
    private equiposService: EquiposService,
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
      if (this.lineaIdParam === this.LINEA_MOTOS_ID) this.tipoCombustible = 'GASOLINA';
    });
    if (this.turnoId || this.vehiculoId) {
      setTimeout(() => this.cargarDatos(), 200);
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
        const todosEquipos = res.equipos || [];
        this.equipos = todosEquipos.filter((e: Equipo) => esEquipoGases(e.equipo || ''));
        if (res.turno) {
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

  /** Al cambiar combustible, se limpia la selección de equipo (el equipo anterior puede no ser válido) */
  onTipoCombustibleChange(): void {
    this.equipoSeleccionadoId = null;
    this.cdr.detectChanges();
  }

  seleccionarEquipo(id: number | null): void {
    if (id === this.equipoSeleccionadoId) {
      this.equipoSeleccionadoId = null;
      return;
    }
    this.equipoSeleccionadoId = id;
    if (id) {
      const eq = this.equiposFiltrados.find(e => (e.equipoid ?? 0) === id);
      if (eq && eq.influencia === 1) {
        this.rellenarValoresAleatorios();
      }
    }
    this.cdr.detectChanges();
  }

  guardarInspeccion(): void {
    if (!this.vehiculoId || !this.metodoInspeccionId) {
      this.notification.error('Faltan datos del turno o vehículo.');
      return;
    }
    const tieneValores = this.tipoCombustible === 'DIESEL'
      ? !isNaN(parseFloat(this.opacidad))
      : (!isNaN(parseFloat(this.co)) || !isNaN(parseFloat(this.hc)));
    if (!tieneValores) {
      this.notification.error('Ingrese al menos un valor medido (CO/HC para gasolina, Opacidad para diesel).');
      return;
    }

    const usuarioId = Number(this.authService.getUsuarioId() ?? 0);
    if (!usuarioId || Number.isNaN(usuarioId)) {
      this.notification.error('No se pudo obtener el usuario logueado. Vuelva a iniciar sesión.');
      return;
    }
    const eqNombre = this.equipoSeleccionadoId
      ? this.equipos.find(e => (e.equipoid ?? 0) === this.equipoSeleccionadoId)?.equipo
      : null;
    const vals = this.esMoto
      ? `CO: ${this.co || 'N/A'}%, HC: ${this.hc || 'N/A'} ppm (RTE INEN 136)`
      : this.tipoCombustible === 'GASOLINA'
        ? `CO: ${this.co || 'N/A'}%, HC: ${this.hc || 'N/A'} ppm${this.lambda ? `, λ: ${this.lambda}` : ''}${this.o2 ? `, O2: ${this.o2}%` : ''}`
        : `Opacidad: ${this.opacidad || 'N/A'}%`;
    const partes = [`${this.tipoCombustible}. ${vals}`];
    if (eqNombre) partes.push(`Equipo: ${eqNombre}`);
    if (this.observaciones) partes.push(this.observaciones);
    const observacionesCompletas = partes.join(' | ');

    const valoresMedidos: Record<string, number> = {};
    if (this.esMoto || this.tipoCombustible === 'GASOLINA') {
      const coVal = parseFloat(this.co);
      if (!isNaN(coVal)) valoresMedidos['CO'] = coVal;
      const hcVal = parseFloat(this.hc);
      if (!isNaN(hcVal)) valoresMedidos['HC'] = hcVal;
      if (!this.esMoto) {
        const lambdaVal = parseFloat(this.lambda);
        if (!isNaN(lambdaVal)) valoresMedidos['LAMBDA'] = lambdaVal;
        const o2Val = parseFloat(this.o2);
        if (!isNaN(o2Val)) valoresMedidos['O2'] = o2Val;
      }
    } else {
      const opVal = parseFloat(this.opacidad);
      if (!isNaN(opVal)) valoresMedidos['OPACIDAD'] = opVal;
    }

    const equiposIds = this.equipoSeleccionadoId ? [this.equipoSeleccionadoId] : [];

    const payload = {
      vehiculoId: this.vehiculoId,
      metodoInspeccionId: this.metodoInspeccionId,
      lineaId: this.lineaIdParam ?? 1,
      usuarioId,
      observaciones: observacionesCompletas,
      defectosIds: [] as number[],
      equiposIds: equiposIds.length > 0 ? equiposIds : undefined,
      valoresMedidos: Object.keys(valoresMedidos).length > 0 ? valoresMedidos : undefined,
      kilometraje: this.kilometraje != null && this.kilometraje >= 0 ? this.kilometraje : undefined
    };

    this.guardando = true;
    this.inspeccionService.crear(payload).subscribe({
      next: (resp: any) => {
        this.guardando = false;
        const res = resp?.resultado ?? resp?.data?.resultado ?? 'APROBADO';
        this.notification.success(`Revisión de gases registrada. Resultado: ${res}`);
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


  rellenarValoresAleatorios(): void {
    this.rellenando = true;
    this.valoresGasesService.obtenerValoresAleatorios(this.tipoCombustible).subscribe({
      next: (vals) => {
        if (this.tipoCombustible === 'DIESEL') {
          this.co = this.hc = this.lambda = this.o2 = '';
          this.opacidad = vals.opacidad ?? '';
        } else {
          this.opacidad = '';
          this.co = vals.co ?? '';
          this.hc = vals.hc ?? '';
          this.lambda = vals.lambda ?? '';
          this.o2 = vals.o2 ?? '';
        }
        this.rellenando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rellenando = false;
        this.notification.error('Error al obtener valores aleatorios.');
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
  }
}
