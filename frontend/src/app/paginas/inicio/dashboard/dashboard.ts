import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { AuditoriaService, AuditoriaRegistro } from '../../../services/administracion/auditoria.service';

export type EstadoTurno = 'GENERADO' | 'PAGADO' | 'ATENDIDO' | 'CONFIRMADO' | 'CANCELADO';

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
  recientesAuditoria: AuditoriaRegistro[] = [];
  cargando = true;
  error = '';

  private readonly ESTADOS: { key: EstadoTurno; label: string }[] = [
    { key: 'GENERADO', label: 'Generado' },
    { key: 'PAGADO', label: 'Pagado' },
    { key: 'ATENDIDO', label: 'Atendido' },
    { key: 'CONFIRMADO', label: 'Confirmado' },
    { key: 'CANCELADO', label: 'Cancelado' }
  ];

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
        this.ESTADOS.forEach(e => { map[e.key] = 0; });
        (turnos ?? []).forEach(t => {
          const est = (t.estado || '').toUpperCase();
          if (est in map) map[est]++;
          else map[est] = (map[est] || 0) + 1;
        });
        this.conteos = this.ESTADOS.map(e => ({
          estado: e.key,
          cantidad: map[e.key] ?? 0,
          label: e.label
        }));
        this.totalTurnos = (turnos ?? []).length;
        this.cargando = false;
        this.cdr.detectChanges();
        this.cargarAuditoria();
      },
      error: () => {
        this.conteos = this.ESTADOS.map(e => ({ estado: e.key, cantidad: 0, label: e.label }));
        this.totalTurnos = 0;
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

  maxConteo(): number {
    const m = Math.max(...this.conteos.map(c => c.cantidad), 1);
    return m;
  }

  porcentaje(cantidad: number): number {
    const m = this.maxConteo();
    return m === 0 ? 0 : Math.round((cantidad / m) * 100);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  iconoEstado(estado: EstadoTurno): string {
    const icons: Record<EstadoTurno, string> = {
      GENERADO: 'schedule',
      PAGADO: 'payments',
      ATENDIDO: 'build',
      CONFIRMADO: 'check_circle',
      CANCELADO: 'cancel'
    };
    return icons[estado] ?? 'help';
  }
}
