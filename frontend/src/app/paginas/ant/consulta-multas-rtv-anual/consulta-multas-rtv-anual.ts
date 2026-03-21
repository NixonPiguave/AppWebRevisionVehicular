import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MultaRtvConsultaService,
  MultaRtvDetalleCompleto,
  MultaRtvResumenFila
} from '../../../services/ant/multa-rtv-consulta.service';

@Component({
  selector: 'app-consulta-multas-rtv-anual',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './consulta-multas-rtv-anual.html',
  styleUrl: './consulta-multas-rtv-anual.css'
})
export class ConsultaMultasRtvAnualComponent implements OnInit {
  filas: MultaRtvResumenFila[] = [];
  cargando = false;
  error = '';

  mostrarDetalle = false;
  detalle: MultaRtvDetalleCompleto | null = null;
  cargandoDetalle = false;
  errorDetalle = '';

  constructor(
    private multaRtvConsulta: MultaRtvConsultaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.multaRtvConsulta.listarResumen().subscribe({
      next: (data) => {
        this.filas = data ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el resumen de multas.';
        this.filas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalles(fila: MultaRtvResumenFila): void {
    this.mostrarDetalle = true;
    this.detalle = null;
    this.errorDetalle = '';
    this.cargandoDetalle = true;
    this.multaRtvConsulta.obtenerDetalle(fila.vehiculoId).subscribe({
      next: (data) => {
        this.detalle = data;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorDetalle = 'No se pudo cargar el detalle.';
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.detalle = null;
    this.errorDetalle = '';
  }
}
