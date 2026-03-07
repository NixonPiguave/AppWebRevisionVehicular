import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  DefectosService,
  Defectos
} from '../../../services/defectos_inspeccion/defectos.service';
import { MetodoInspeccionService, MetodoInspeccion } from '../../../services/inspeccion_rtv/metodo_inspeccion.service';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { InspeccionService } from '../../../services/inspeccion_rtv/inspeccion.service';
import { UmbralService } from '../../../services/configuracion_umbral/umbral.service';
import { LineasService } from '../../../services/inspeccion_rtv/lineas.service';
import { VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { NotificationService } from '../../../services/notification.service';
import { forkJoin } from 'rxjs';

interface UbicacionesRevisadas {
  delantera:         boolean;
  ruedaDelIzq:       boolean;
  ruedaDelDer:       boolean;
  lateralIzquierdo:  boolean;
  lateralDerecho:    boolean;
  ruedaTraIzq:       boolean;
  ruedaTraDer:       boolean;
  trasera:           boolean;
  habitaculo:        boolean;
  parteInferior:     boolean;
}

interface VehiculoInfo {
  matricula?: string;
  chasis?: string;
  id?: number;
}

@Component({
  selector: 'app-registrar-inspeccion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './registrar-inspeccion.html',
  styleUrl: './registrar-inspeccion.css'
})
export class RegistrarInspeccionComponent implements OnInit {

  turnoId: number | null = null;
  vehiculoId: number | null = null;
  vehiculoInfo: VehiculoInfo | null = null;

  defectos: Defectos[] = [];
  metodosInspeccion: MetodoInspeccion[] = [];
  umbrales: { idUmbral: number }[] = [];
  lineas: { id: number }[] = [];

  ubicaciones: UbicacionesRevisadas = {
    delantera:        false,
    ruedaDelIzq:      false,
    ruedaDelDer:      false,
    lateralIzquierdo: false,
    lateralDerecho:   false,
    ruedaTraIzq:      false,
    ruedaTraDer:      false,
    trasera:          false,
    habitaculo:       false,
    parteInferior:    false
  };

  defectosSeleccionados: Defectos[] = [];
  filtroDefectos = '';
  paginaDefectos = 1;
  registrosPorPaginaDefectos = 15;

  observaciones = '';
  cargando = false;
  guardando = false;
  error = '';
  sinTurnoSeleccionado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private defectosService: DefectosService,
    private metodoInspeccionService: MetodoInspeccionService,
    private turnosService: TurnosService,
    private inspeccionService: InspeccionService,
    private umbralService: UmbralService,
    private lineasService: LineasService,
    private vehiculoService: VehiculoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
      this.vehiculoId = params['vehiculoId'] ? +params['vehiculoId'] : null;
    });

    setTimeout(() => {
      if (this.turnoId || this.vehiculoId) {
        this.cargarDatos();
      }
    }, 200);
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    const observables: {
      defectos?: ReturnType<DefectosService['listar']>;
      metodos?: ReturnType<MetodoInspeccionService['listarMetodosInspeccion']>;
      umbrales?: ReturnType<UmbralService['listar']>;
      lineas?: ReturnType<LineasService['listarRoles']>;
      turno?: ReturnType<TurnosService['getById']>;
    } = {};

    observables.defectos = this.defectosService.listar();
    observables.metodos = this.metodoInspeccionService.listarMetodosInspeccion();
    observables.umbrales = this.umbralService.listar();
    observables.lineas = this.lineasService.listarRoles();

    if (this.turnoId) {
      observables.turno = this.turnosService.getById(this.turnoId);
    }

    forkJoin(observables).subscribe({
      next: (res: any) => {
        this.defectos = res.defectos || [];
        this.metodosInspeccion = res.metodos || [];
        this.umbrales = (res.umbrales || []).map((u: any) => ({ idUmbral: u.idUmbral ?? u.id }));
        this.lineas = (res.lineas || []).map((l: any) => ({ id: l.id }));

        if (res.turno) {
          const vid = (res.turno as any).vehiculoId ?? (res.turno as any).vehiculo?.id ?? null;
          this.vehiculoId = vid ? Number(vid) : null;
          if (this.vehiculoId) this.cargarVehiculoInfo(this.vehiculoId);
        } else if (this.vehiculoId) {
          this.cargarVehiculoInfo(this.vehiculoId);
        }

        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando datos:', err);
        this.error = 'Error al cargar los datos. Verifique que el backend esté en ejecución.';
        this.cargando = false;
      }
    });
  }

  cargarVehiculoInfo(id: number): void {
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v: any) => {
        this.vehiculoInfo = { id: v.id, matricula: v.matricula || v.placa, chasis: v.chasis };
      },
      error: () => {
        this.vehiculoInfo = { id, matricula: `Veh #${id}` };
      }
    });
  }

  get defectosFiltrados(): Defectos[] {
    if (!this.filtroDefectos.trim()) return this.defectos;
    const f = this.filtroDefectos.toLowerCase();
    return this.defectos.filter(d =>
      (d.codigo || '').toLowerCase().includes(f) ||
      (d.descripcion || '').toLowerCase().includes(f) ||
      (d.puntoDeTrabajo || '').toLowerCase().includes(f) ||
      (d.maquinaria || '').toLowerCase().includes(f)
    );
  }

  get defectosFiltradosPaginados(): Defectos[] {
    const inicio = (this.paginaDefectos - 1) * this.registrosPorPaginaDefectos;
    return this.defectosFiltrados.slice(inicio, inicio + this.registrosPorPaginaDefectos);
  }

  get totalPaginasDefectos(): number {
    return Math.ceil(this.defectosFiltrados.length / this.registrosPorPaginaDefectos) || 1;
  }

  irPaginaDefectos(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasDefectos) this.paginaDefectos = pagina;
  }

  estaDefectoSeleccionado(defectoId: number | null | undefined): boolean {
    if (!defectoId) return false;
    return this.defectosSeleccionados.some(d => (d.id ?? 0) === defectoId);
  }

  toggleDefecto(defecto: Defectos): void {
    const idx = this.defectosSeleccionados.findIndex(d => (d.id ?? 0) === (defecto.id ?? 0));
    if (idx >= 0) this.defectosSeleccionados.splice(idx, 1);
    else           this.defectosSeleccionados.push(defecto);
  }

  // Convierte el objeto de ubicaciones a array de strings para el payload
  getUbicacionesArray(): string[] {
    const map: [keyof UbicacionesRevisadas, string][] = [
      ['delantera',        'Delantera'],
      ['ruedaDelIzq',      'Rueda_Delantera_Izq'],
      ['ruedaDelDer',      'Rueda_Delantera_Der'],
      ['lateralIzquierdo', 'Lateral_Izquierdo'],
      ['lateralDerecho',   'Lateral_Derecho'],
      ['ruedaTraIzq',      'Rueda_Trasera_Izq'],
      ['ruedaTraDer',      'Rueda_Trasera_Der'],
      ['trasera',          'Trasera'],
      ['habitaculo',       'Habitaculo'],
      ['parteInferior',    'Parte_Inferior'],
    ];
    return map.filter(([key]) => this.ubicaciones[key]).map(([, val]) => val);
  }

  // Número total de ubicaciones seleccionadas (para mostrar en UI)
  get totalUbicaciones(): number {
    return this.getUbicacionesArray().length;
  }

  guardarInspeccion(): void {
    if (!this.vehiculoId) {
      this.notification.error('No hay vehículo asociado a esta inspección.');
      return;
    }

    const metodoVisual = this.metodosInspeccion.find(m =>
      (m.nombre || '').toLowerCase().includes('visual')
    );
    const metodoId  = metodoVisual?.id ?? this.metodosInspeccion[0]?.id ?? 1;
    const umbralId  = this.umbrales[0]?.idUmbral ?? 1;
    const lineaId   = this.lineas[0]?.id ?? 1;

    const defectosIds = this.defectosSeleccionados
      .map(d => d.id)
      .filter((id): id is number => id != null && id > 0);

    const payload = {
      vehiculoId: this.vehiculoId,
      metodoInspeccionId: metodoId,
      lineaId,
      usuarioId: 1,
      observaciones: this.observaciones.trim() || undefined,
      ubicacionesRevisadas: this.getUbicacionesArray(),
      defectosIds
    };

    this.guardando = true;
    this.inspeccionService.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success('Inspección registrada correctamente.');
        this.volver();
      },
      error: err => {
        console.error('Error al guardar inspección:', err);
        this.guardando = false;
        this.notification.error(err?.error?.message || 'Error al guardar la inspección. Verifique el backend.');
      }
    });
  }

  volver(): void {
    if (this.turnoId) this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
    else              this.router.navigate(['/inicio']);
  }

  irATurnosPagados(): void {
    this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
  }
}
