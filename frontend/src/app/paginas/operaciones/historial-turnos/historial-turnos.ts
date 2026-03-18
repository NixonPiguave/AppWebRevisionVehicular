import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { ServicioService } from '../../../services/administracion/servicio.service';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { CertificadoRtvService } from '../../../services/operaciones/certificado-rtv.service';
import { catchError } from 'rxjs/operators';

const API = 'http://localhost:8080/api';

export interface TurnoHistorialRaw {
  turnoId: number;
  propietarioId: number;
  vehiculoId: number;
  servicioId: number;
  tramiteId: number | null;
  entidadId: number | null;
  estado: string;
  montoPagado: number | null;
  fechaInicio: string;
  fechaFin: string | null;
  fechaCancelado: string | null;
  validador: string | null;
}

export interface TurnoHistorialEnriquecido extends TurnoHistorialRaw {
  propietarioNombre: string;
  vehiculoDescripcion: string;
  servicioNombre: string;
  tipoTramite: string;
}

@Component({
  selector: 'app-historial-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './historial-turnos.html',
  styleUrl: './historial-turnos.css'
})
export class HistorialTurnosComponent implements OnInit {

  turnos: TurnoHistorialEnriquecido[] = [];
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
    return 'INSPECCION';
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.turnos = [];

    this.turnosService.getPorEstado('FINALIZADO').pipe(
      catchError(() => of([] as TurnoHistorialRaw[]))
    ).subscribe(raw => {
      const lista = (raw || []) as TurnoHistorialRaw[];
      if (lista.length === 0) {
        this.cargando = false;
        this.cdr.detectChanges();
        return;
      }

      const propietarioIds = [...new Set(lista.map(t => t.propietarioId))];
      const vehiculoIds = [...new Set(lista.map(t => t.vehiculoId))];

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
          const propMap = new Map<number, any>();
          propietarios.forEach((p: any) => {
            const id = p.idPropietario ?? p.id ?? p.propietarioId;
            propMap.set(id, p);
          });
          const vehMap = new Map<number, any>();
          vehiculos.forEach((v: any) => {
            const id = v.id ?? v.idVehiculo ?? v.vehiculoId;
            vehMap.set(id, v);
          });

          this.turnos = lista.map(t => {
            const prop = propMap.get(t.propietarioId);
            const veh = vehMap.get(t.vehiculoId);
            const svc = this.mapaServicios[t.servicioId];
            return {
              ...t,
              propietarioNombre: this.extraerNombrePropietario(prop, t.propietarioId),
              vehiculoDescripcion: this.extraerDescripcionVehiculo(veh, t.vehiculoId),
              servicioNombre: svc?.nombre ?? `Servicio #${t.servicioId}`,
              tipoTramite: svc?.tipo ?? 'INSPECCION',
            };
          });
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.turnos = lista.map(t => ({
            ...t,
            propietarioNombre: `Propietario #${t.propietarioId}`,
            vehiculoDescripcion: `Vehículo #${t.vehiculoId}`,
            servicioNombre: this.mapaServicios[t.servicioId]?.nombre ?? `Servicio #${t.servicioId}`,
            tipoTramite: this.mapaServicios[t.servicioId]?.tipo ?? 'INSPECCION',
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  private extraerNombrePropietario(p: any, fallbackId: number): string {
    if (!p) return `Propietario #${fallbackId}`;
    const nombre = p.nombre ?? p.nombres ?? p.name ?? '';
    const apellido = p.apellido ?? p.apellidos ?? p.lastName ?? '';
    if (nombre && apellido) return `${nombre} ${apellido}`;
    if (nombre) return nombre;
    if (p.nombreCompleto) return p.nombreCompleto;
    if (p.razonSocial) return p.razonSocial;
    return `Propietario #${fallbackId}`;
  }

  private extraerDescripcionVehiculo(v: any, fallbackId: number): string {
    if (!v) return `Vehículo #${fallbackId}`;
    const placa = v.matricula ?? v.placa ?? '';
    let marca = '';
    if (typeof v.marca === 'string') marca = v.marca;
    else if (typeof v.marca === 'object' && v.marca) marca = v.marca.descripcion ?? v.marca.nombre ?? '';
    marca = marca || (v.marcaDescripcion ?? v.nombreMarca ?? '');
    let modelo = '';
    if (typeof v.modelo === 'string') modelo = v.modelo;
    else if (typeof v.modelo === 'object' && v.modelo) modelo = v.modelo.descripcion ?? v.modelo.nombre ?? '';
    modelo = modelo || (v.modeloDescripcion ?? v.nombreModelo ?? '');
    if (marca && modelo && placa) return `${marca} ${modelo} (${placa})`;
    if (marca && modelo) return `${marca} ${modelo}`;
    if (placa) return placa;
    return `Vehículo #${fallbackId}`;
  }

  get filtrados(): TurnoHistorialEnriquecido[] {
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

  get paginados(): TurnoHistorialEnriquecido[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina) || 1; }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { if (p >= 1 && p <= this.totalPaginas) this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  verCertificado(t: TurnoHistorialEnriquecido): void {
    this.certificadoRtvService.mostrar(t.turnoId);
  }

  getTramiteIcon(tipo: string): string {
    if (tipo === 'BAJA') return 'remove_circle';
    if (tipo === 'DESBLOQUEO') return 'lock_open';
    if (tipo === 'BLOQUEO') return 'lock';
    return 'fact_check';
  }

  getTramiteClass(tipo: string): string {
    if (tipo === 'BAJA') return 'tipo-baja';
    if (tipo === 'DESBLOQUEO') return 'tipo-desbloqueo';
    if (tipo === 'BLOQUEO') return 'tipo-bloqueo';
    return 'tipo-inspeccion';
  }
}
