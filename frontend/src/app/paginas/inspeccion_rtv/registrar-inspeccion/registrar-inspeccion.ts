import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { DatosFabricaService, DatosFabrica } from '../../../services/gestion_vehicular/datos-fabrica.service';
import { NotificationService } from '../../../services/notification.service';
import { forkJoin } from 'rxjs';

/** Ubicaciones para línea Carros */
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

/** Ubicaciones para línea Motos (RTV Ecuador) */
interface UbicacionesMoto {
  delantera:         boolean;  // faros, manillar
  ruedaDelantera:    boolean;
  lateralIzquierdo:  boolean;
  lateralDerecho:    boolean;
  ruedaTrasera:      boolean;
  trasera:           boolean;  // luces, placa
  chasis:            boolean;  // parte inferior
}

interface VehiculoInfo {
  matricula?:       string;
  chasis?:          string;
  id?:              number;

  color?:           string;
  marca?:           string;
  modelo?:          string;
  anioFabricacion?: number;
  vin?:             string;
}



interface CampoComparado {
  etiqueta: string;
  valorVehiculo: string;
  valorFabrica:  string;
  coincide:      boolean;
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


  readonly LINEA_MOTOS_ID = 1;

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

  ubicacionesMoto: UbicacionesMoto = {
    delantera:        false,
    ruedaDelantera:   false,
    lateralIzquierdo: false,
    lateralDerecho:   false,
    ruedaTrasera:     false,
    trasera:          false,
    chasis:           false
  };

  get esMoto(): boolean {
    return this.lineaIdParam === this.LINEA_MOTOS_ID;
  }

  defectosSeleccionados: Defectos[] = [];
  filtroDefectos = '';
  paginaDefectos = 1;
  registrosPorPaginaDefectos = 15;

  observaciones = '';
  cargando = false;
  guardando = false;
  error = '';
  sinTurnoSeleccionado = false;


  camposComparados: CampoComparado[] = [];

  get estadoFabrica(): 'coincide' | 'discrepancia' | 'no-encontrado' | 'sin-datos' {
    if (!this.vehiculoInfo) return 'sin-datos';
    if (this.camposComparados.length === 0) return 'no-encontrado';
    return this.camposComparados.every(c => c.coincide) ? 'coincide' : 'discrepancia';
  }

  get camposConDiscrepancia(): CampoComparado[] {
    return this.camposComparados.filter(c => !c.coincide);
  }



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private defectosService: DefectosService,
    private metodoInspeccionService: MetodoInspeccionService,
    private turnosService: TurnosService,
    private inspeccionService: InspeccionService,
    private umbralService: UmbralService,
    private vehiculoService: VehiculoService,
    private datosFabricaService: DatosFabricaService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  metodoInspeccionIdParam: number | null = null;
  lineaIdParam: number | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
      this.vehiculoId = params['vehiculoId'] ? +params['vehiculoId'] : null;
      this.metodoInspeccionIdParam = params['metodoInspeccionId'] ? +params['metodoInspeccionId'] : null;
      this.lineaIdParam = params['lineaId'] ? +params['lineaId'] : null;
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
      turno?: ReturnType<TurnosService['getById']>;
    } = {};

    observables.defectos = this.defectosService.listar();
    observables.metodos = this.metodoInspeccionService.listarMetodosInspeccion();
    observables.umbrales = this.umbralService.listar();

    if (this.turnoId) {
      observables.turno = this.turnosService.getById(this.turnoId);
    }

    forkJoin(observables).subscribe({
      next: (res: any) => {
        this.defectos = res.defectos || [];
        this.metodosInspeccion = res.metodos || [];
        this.umbrales = (res.umbrales || []).map((u: any) => ({ idUmbral: u.idUmbral ?? u.id }));

        if (res.turno) {
          const vid = (res.turno as any).vehiculoId ?? (res.turno as any).vehiculo?.id ?? null;
          this.vehiculoId = vid ? Number(vid) : null;
          if (this.vehiculoId) this.cargarVehiculoInfo(this.vehiculoId);
        } else if (this.vehiculoId) {
          this.cargarVehiculoInfo(this.vehiculoId);
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error cargando datos:', err);
        this.error = 'Error al cargar los datos. Verifique que el backend esté en ejecución.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarVehiculoInfo(id: number): void {
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v: any) => {
        this.vehiculoInfo = {
          id:              v.id,
          matricula:       v.matricula || v.placa,
          chasis:          v.chasis,
          vin:             v.vin,
          marca:           v.marcaNombre || v.marca?.nombre || v.marca || '',
          modelo:          v.modeloNombre || v.modelo?.nombre || v.modelo || '',
          color:           v.color,
          anioFabricacion: v.anioFabricacion
        };
        this.cargarDatosFabricaYComparar();
      },
      error: () => {
        this.vehiculoInfo = { id, matricula: `Veh #${id}` };
        this.camposComparados = [];
        this.cdr.detectChanges();
      }
    });
  }

  /** Busca datos de fábrica en BD y compara con datos del vehículo */
  private cargarDatosFabricaYComparar(): void {
    if (!this.vehiculoInfo?.matricula) {
      this.camposComparados = [];
      this.cdr.detectChanges();
      return;
    }
    this.datosFabricaService.buscarPorMatricula(this.vehiculoInfo.matricula).subscribe({
      next: (fabrica) => {
        this.compararConFabrica(fabrica);
        this.cdr.detectChanges();
      },
      error: () => {
        this.camposComparados = [];
        this.cdr.detectChanges();
      }
    });
  }

  /** Compara datos del vehículo con datos de fábrica (desde BD) */
  private compararConFabrica(fabrica: DatosFabrica | null): void {
    if (!this.vehiculoInfo || !fabrica) {
      this.camposComparados = [];
      return;
    }

    const cmp = (a: string | number | undefined, b: string | number | undefined) =>
      String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

    this.camposComparados = [
      {
        etiqueta:      'VIN',
        valorVehiculo: this.vehiculoInfo.vin   ?? '—',
        valorFabrica:  fabrica.vin ?? '—',
        coincide:      cmp(this.vehiculoInfo.vin, fabrica.vin)
      },
      {
        etiqueta:      'Marca',
        valorVehiculo: this.vehiculoInfo.marca ?? '—',
        valorFabrica:  fabrica.marca ?? '—',
        coincide:      cmp(this.vehiculoInfo.marca, fabrica.marca)
      },
      {
        etiqueta:      'Modelo',
        valorVehiculo: this.vehiculoInfo.modelo ?? '—',
        valorFabrica:  fabrica.modelo ?? '—',
        coincide:      cmp(this.vehiculoInfo.modelo, fabrica.modelo)
      },
      {
        etiqueta:      'Color',
        valorVehiculo: this.vehiculoInfo.color ?? '—',
        valorFabrica:  fabrica.color ?? '—',
        coincide:      cmp(this.vehiculoInfo.color, fabrica.color)
      }
    ];
  }

  // ════════════════════════════════════════════════════════════
  //  El resto del componente permanece igual
  // ════════════════════════════════════════════════════════════

  /** Palabras clave por ubicación (carros) para filtrar defectos */
  private readonly UBICACION_KEYWORDS: Record<keyof UbicacionesRevisadas, string[]> = {
    delantera:        ['delantera', 'frontal', 'frente', 'delantero'],
    ruedaDelIzq:      ['rueda delantera', 'del izq', 'izquierda', 'delantera izq'],
    ruedaDelDer:      ['rueda delantera', 'del der', 'derecha', 'delantera der'],
    lateralIzquierdo: ['lateral', 'izquierdo', 'lateral izq'],
    lateralDerecho:   ['lateral', 'derecho', 'lateral der'],
    ruedaTraIzq:      ['rueda trasera', 'tra izq', 'trasera izq', 'posterior izq'],
    ruedaTraDer:      ['rueda trasera', 'tra der', 'trasera der', 'posterior der'],
    trasera:          ['trasera', 'posterior', 'retaguardia'],
    habitaculo:       ['habitaculo', 'habitáculo', 'interior', 'cabina', 'tablero'],
    parteInferior:    ['inferior', 'chasis', 'fosa', 'subsuelo', 'piso', 'parte inferior']
  };

  /** Palabras clave por ubicación (motos) para filtrar defectos */
  private readonly UBICACION_KEYWORDS_MOTO: Record<keyof UbicacionesMoto, string[]> = {
    delantera:        ['delantera', 'frontal', 'frente', 'faros', 'manillar'],
    ruedaDelantera:   ['rueda delantera', 'delantera'],
    lateralIzquierdo: ['lateral', 'izquierdo', 'lateral izq'],
    lateralDerecho:   ['lateral', 'derecho', 'lateral der'],
    ruedaTrasera:     ['rueda trasera', 'trasera'],
    trasera:          ['trasera', 'posterior', 'luces', 'placa'],
    chasis:           ['chasis', 'inferior', 'parte inferior']
  };

  /** Obtiene todas las palabras clave de las ubicaciones seleccionadas */
  private getKeywordsUbicacionesSeleccionadas(): string[] {
    const keywords = new Set<string>();
    if (this.esMoto) {
      const keys = (Object.keys(this.ubicacionesMoto) as (keyof UbicacionesMoto)[])
        .filter(k => this.ubicacionesMoto[k]);
      keys.forEach(k => (this.UBICACION_KEYWORDS_MOTO[k] || []).forEach(w => keywords.add(w)));
    } else {
      const keys = (Object.keys(this.ubicaciones) as (keyof UbicacionesRevisadas)[])
        .filter(k => this.ubicaciones[k]);
      keys.forEach(k => (this.UBICACION_KEYWORDS[k] || []).forEach(w => keywords.add(w)));
    }
    return Array.from(keywords);
  }

  /** Indica si un defecto coincide con alguna ubicación seleccionada */
  private defectoCoincideUbicacion(d: Defectos): boolean {
    const keywords = this.getKeywordsUbicacionesSeleccionadas();
    if (keywords.length === 0) return true; // Sin ubicaciones → mostrar todos
    const texto = [
      d.puntoDeTrabajo || '',
      d.descripcion || '',
      d.nombreSubfamilia || '',
      d.maquinaria || ''
    ].join(' ').toLowerCase();
    return keywords.some(kw => texto.includes(kw.toLowerCase()));
  }

  get defectosFiltrados(): Defectos[] {
    let lista = this.defectos;
    // Filtrar por ubicaciones seleccionadas
    lista = lista.filter(d => this.defectoCoincideUbicacion(d));
    // Filtrar por búsqueda de texto
    if (this.filtroDefectos.trim()) {
      const f = this.filtroDefectos.toLowerCase();
      lista = lista.filter(d =>
        (d.codigo || '').toLowerCase().includes(f) ||
        (d.descripcion || '').toLowerCase().includes(f) ||
        (d.puntoDeTrabajo || '').toLowerCase().includes(f) ||
        (d.maquinaria || '').toLowerCase().includes(f) ||
        (d.nombreSubfamilia || '').toLowerCase().includes(f)
      );
    }
    return lista;
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

  getUbicacionesArray(): string[] {
    if (this.esMoto) {
      const map: [keyof UbicacionesMoto, string][] = [
        ['delantera',        'Delantera'],
        ['ruedaDelantera',   'Rueda_Delantera'],
        ['lateralIzquierdo', 'Lateral_Izquierdo'],
        ['lateralDerecho',   'Lateral_Derecho'],
        ['ruedaTrasera',     'Rueda_Trasera'],
        ['trasera',          'Trasera'],
        ['chasis',           'Chasis'],
      ];
      return map.filter(([key]) => this.ubicacionesMoto[key]).map(([, val]) => val);
    }
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

  get totalUbicaciones(): number {
    return this.getUbicacionesArray().length;
  }

  guardarInspeccion(): void {
    if (!this.vehiculoId) {
      this.notification.error('No hay vehículo asociado a esta inspección.');
      return;
    }

    const metodoId = this.metodoInspeccionIdParam
      ?? this.metodosInspeccion.find(m => (m.nombre || '').toLowerCase().includes('visual'))?.id
      ?? this.metodosInspeccion[0]?.id
      ?? 1;
    const umbralId  = this.umbrales[0]?.idUmbral ?? 1;

    const defectosIds = this.defectosSeleccionados
      .map(d => d.id)
      .filter((id): id is number => id != null && id > 0);

    const payload = {
      vehiculoId: this.vehiculoId,
      metodoInspeccionId: metodoId,
      lineaId: this.lineaIdParam ?? 1,
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
        this.cdr.detectChanges();
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
