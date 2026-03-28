import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { AuditoriaService, AuditoriaRegistro } from '../../../services/administracion/auditoria.service';

export type EstadoTurno =
  | 'GENERADO'
  | 'PAGADO'
  | 'EN_PROCESO'
  | 'CONFIRMADO'
  | 'FINALIZADO'
  | 'CANCELADO'
  | 'OTROS';

interface ConteoEstado {
  estado: EstadoTurno;
  cantidad: number;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  conteos: ConteoEstado[] = [];
  totalTurnos = 0;
  /** Porcentajes enteros por estado; con total > 0 suman 100 % (método del mayor resto). */
  porcentajeEnteroPorEstado: Record<string, number> = {};
  recientesAuditoria: AuditoriaRegistro[] = [];
  cargando = true;
  error = '';

  /** Estados reconocidos en BD / negocio (deben sumar el total con “Otros” si hay valores raros). */
  private readonly ESTADOS: { key: Exclude<EstadoTurno, 'OTROS'>; label: string }[] = [
    { key: 'GENERADO', label: 'Generado' },
    { key: 'PAGADO', label: 'Pagado' },
    { key: 'EN_PROCESO', label: 'En proceso' },
    { key: 'CONFIRMADO', label: 'Confirmado' },
    { key: 'FINALIZADO', label: 'Finalizado' },
    { key: 'CANCELADO', label: 'Cancelado' }
  ];

  private readonly ESTADOS_CONOCIDOS = new Set(this.ESTADOS.map((e) => e.key));

  constructor(
    private turnosService: TurnosService,
    private auditoriaService: AuditoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.turnosService.getAll().subscribe({
      next: (turnos) => {
        const map: Record<string, number> = {};
        this.ESTADOS.forEach((e) => {
          map[e.key] = 0;
        });
        let otros = 0;
        (turnos ?? []).forEach((t) => {
          let est = (t.estado || '').trim().toUpperCase();
          if (!est) {
            otros++;
            return;
          }
          if (est === 'ATENDIDO') est = 'EN_PROCESO'; // alias histórico en UI
          if (this.ESTADOS_CONOCIDOS.has(est as Exclude<EstadoTurno, 'OTROS'>)) {
            map[est]++;
          } else {
            otros++;
          }
        });
        this.conteos = this.ESTADOS.map((e) => ({
          estado: e.key,
          cantidad: map[e.key] ?? 0,
          label: e.label
        }));
        if (otros > 0) {
          this.conteos.push({ estado: 'OTROS', cantidad: otros, label: 'Otros / sin clasificar' });
        }
        this.totalTurnos = (turnos ?? []).length;
        this.actualizarPorcentajesVisuales();
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarAuditoria();
      },
      error: () => {
        this.conteos = this.ESTADOS.map((e) => ({ estado: e.key, cantidad: 0, label: e.label }));
        this.totalTurnos = 0;
        this.actualizarPorcentajesVisuales();
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarAuditoria();
      }
    });
  }

  private cargarAuditoria(): void {
    this.auditoriaService.listarTodas().subscribe({
      next: (lista) => {
        this.recientesAuditoria = (lista ?? []).slice(0, 8);
        this.cdr.detectChanges();
      },
      error: () => { this.recientesAuditoria = []; this.cdr.detectChanges(); }
    });
  }

  /**
   * Reparte 100 puntos porcentuales en enteros sin que la suma pase de 100 %
   * (método del mayor resto; ver NIST / elecciones proporcionales).
   */
  private actualizarPorcentajesVisuales(): void {
    this.porcentajeEnteroPorEstado = this.calcularPorcentajesLargestRemainder(
      this.conteos,
      this.totalTurnos
    );
  }

  private calcularPorcentajesLargestRemainder(
    conteos: ConteoEstado[],
    total: number
  ): Record<string, number> {
    const out: Record<string, number> = {};
    conteos.forEach((c) => {
      out[c.estado] = 0;
    });
    if (total <= 0 || conteos.length === 0) {
      return out;
    }

    type Row = { estado: EstadoTurno; floor: number; rem: number };
    const rows: Row[] = conteos.map((c) => {
      const exact = (c.cantidad * 100) / total;
      const floor = Math.floor(exact + 1e-9);
      return { estado: c.estado, floor, rem: exact - floor };
    });
    const sumFloor = rows.reduce((s, r) => s + r.floor, 0);
    let diff = 100 - sumFloor;
    if (diff < 0) {
      diff = 0;
    }
    const order = rows.map((_, i) => i);
    order.sort((i, j) => {
      const d = rows[j].rem - rows[i].rem;
      if (d !== 0) {
        return d;
      }
      return i - j;
    });
    const bonus = new Set(order.slice(0, diff));
    rows.forEach((r, i) => {
      out[r.estado] = r.floor + (bonus.has(i) ? 1 : 0);
    });
    return out;
  }

  /** Ancho de barra = mismo entero que el texto % (suma 100 % entre filas). */
  porcentajeBarra(estado: EstadoTurno): number {
    return this.porcentajeEnteroPorEstado[estado] ?? 0;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  /** Texto "% del total" coherente con el reparto que suma 100 %. */
  porcentajeTexto(estado: EstadoTurno): string {
    return `${this.porcentajeEnteroPorEstado[estado] ?? 0}%`;
  }

  cantidadDe(estado: EstadoTurno): number {
    return this.conteos.find((c) => c.estado === estado)?.cantidad ?? 0;
  }

  kpiCanceladosOtros(): number {
    return this.cantidadDe('CANCELADO') + this.cantidadDe('OTROS');
  }

  /** Turnos aún en camino operativo antes de cierre o cancelación. */
  turnosEnFlujo(): number {
    const flujo = new Set<string>(['GENERADO', 'PAGADO', 'EN_PROCESO', 'CONFIRMADO']);
    return this.conteos.filter((c) => flujo.has(c.estado)).reduce((s, c) => s + c.cantidad, 0);
  }

  fechaLarga(): string {
    return new Date().toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /** Segmentos con cantidad > 0 (gráfico de dona y totales coherentes). */
  conteosConDato(): ConteoEstado[] {
    return this.conteos.filter((c) => c.cantidad > 0);
  }

  /** Color de cada estado (misma paleta que el panel). */
  colorHex(estado: EstadoTurno): string {
    const m: Record<EstadoTurno, string> = {
      GENERADO: '#40916c',
      PAGADO: '#2d6a4f',
      EN_PROCESO: '#1d6fb8',
      CONFIRMADO: '#52b788',
      FINALIZADO: '#74c69d',
      CANCELADO: '#9b4d4d',
      OTROS: '#6c757d'
    };
    return m[estado] ?? '#6c757d';
  }

  /** Fondo en forma de dona para el gráfico circular (solo proporciones > 0). */
  donutConicGradient(): string {
    const datos = this.conteosConDato();
    if (this.totalTurnos === 0 || datos.length === 0) {
      return 'conic-gradient(#e8ece9 0deg 360deg)';
    }
    let acc = 0;
    const partes: string[] = [];
    for (const c of datos) {
      const ini = (acc / this.totalTurnos) * 360;
      acc += c.cantidad;
      const fin = (acc / this.totalTurnos) * 360;
      partes.push(`${this.colorHex(c.estado)} ${ini.toFixed(3)}deg ${fin.toFixed(3)}deg`);
    }
    return `conic-gradient(${partes.join(', ')})`;
  }
}
