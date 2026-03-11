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
  matricula?:       string;
  chasis?:          string;
  id?:              number;
  // ── campos extra que llegan del backend ──
  color?:           string;
  marca?:           string;
  modelo?:          string;
  anioFabricacion?: number;
  vin?:             string;
}

// ── Estructura del registro de fábrica simulado ──────────────
interface DatosFabrica {
  matricula:        string;   // clave de búsqueda
  chasis:           string;
  vin:              string;
  marca:            string;
  modelo:           string;
  color:            string;
  anioFabricacion:  number;
}

// ── Resultado de comparar un campo ──────────────────────────
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


  private readonly datosFabrica: DatosFabrica[] = [
    {
      matricula:       'HC-2LIA',
      chasis:          'ABC123456789',
      vin:             'VIN001ABC2024',
      marca:           'Toyota',
      modelo:          'Corolla',
      color:           'Blanco',
      anioFabricacion: 2020
    },
    {
      matricula:       'GXK-0234',
      chasis:          'DEF987654321',
      vin:             'VIN002DEF2022',
      marca:           'Chevrolet',
      modelo:          'Aveo',
      color:           'Rojo',
      anioFabricacion: 2022
    },
    {
      matricula:       'PBG-1122',
      chasis:          'GHI112233445',
      vin:             'VIN003GHI2019',
      marca:           'Hyundai',
      modelo:          'Tucson',
      color:           'Gris',
      anioFabricacion: 2019
    },
    {
      matricula:       'AAA-0001',
      chasis:          'JKL556677889',
      vin:             'VIN004JKL2023',
      marca:           'Kia',
      modelo:          'Sportage',
      color:           'Negro',
      anioFabricacion: 2023
    },
    {
      matricula:       'BBB-0002',
      chasis:          'MNO998877665',
      vin:             'VIN005MNO2021',
      marca:           'Nissan',
      modelo:          'Sentra',
      color:           'Azul',
      anioFabricacion: 2021
    }
  ];

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
    private lineasService: LineasService,
    private vehiculoService: VehiculoService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  metodoInspeccionIdParam: number | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
      this.vehiculoId = params['vehiculoId'] ? +params['vehiculoId'] : null;
      this.metodoInspeccionIdParam = params['metodoInspeccionId'] ? +params['metodoInspeccionId'] : null;
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
        this.compararConFabrica();
        this.cdr.detectChanges();
      },
      error: () => {
        this.vehiculoInfo = { id, matricula: `Veh #${id}` };
        this.camposComparados = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ── Busca la matrícula en datosFabrica y compara campo por campo ──
  private compararConFabrica(): void {
    if (!this.vehiculoInfo?.matricula) {
      this.camposComparados = [];
      return;
    }

    const matricula = (this.vehiculoInfo.matricula ?? '').trim().toUpperCase();
    const fabrica = this.datosFabrica.find(
      f => f.matricula.toUpperCase() === matricula
    );

    if (!fabrica) {
      this.camposComparados = [];
      return;
    }

    const cmp = (a: string | number | undefined, b: string | number) =>
      String(a ?? '').trim().toLowerCase() === String(b).trim().toLowerCase();

    this.camposComparados = [
      {
        etiqueta:      'VIN',
        valorVehiculo: this.vehiculoInfo.vin   ?? '—',
        valorFabrica:  fabrica.vin,
        coincide:      cmp(this.vehiculoInfo.vin, fabrica.vin)
      },
      {
        etiqueta:      'Marca',
        valorVehiculo: this.vehiculoInfo.marca ?? '—',
        valorFabrica:  fabrica.marca,
        coincide:      cmp(this.vehiculoInfo.marca, fabrica.marca)
      },
      {
        etiqueta:      'Modelo',
        valorVehiculo: this.vehiculoInfo.modelo ?? '—',
        valorFabrica:  fabrica.modelo,
        coincide:      cmp(this.vehiculoInfo.modelo, fabrica.modelo)
      },
      {
        etiqueta:      'Color',
        valorVehiculo: this.vehiculoInfo.color ?? '—',
        valorFabrica:  fabrica.color,
        coincide:      cmp(this.vehiculoInfo.color, fabrica.color)
      }
    ];
  }

  // ════════════════════════════════════════════════════════════
  //  El resto del componente permanece igual
  // ════════════════════════════════════════════════════════════

  /** Palabras clave por ubicación para filtrar defectos */
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

  /** Obtiene todas las palabras clave de las ubicaciones seleccionadas */
  private getKeywordsUbicacionesSeleccionadas(): string[] {
    const keys = (Object.keys(this.ubicaciones) as (keyof UbicacionesRevisadas)[])
      .filter(k => this.ubicaciones[k]);
    const keywords = new Set<string>();
    keys.forEach(k => (this.UBICACION_KEYWORDS[k] || []).forEach(w => keywords.add(w)));
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
