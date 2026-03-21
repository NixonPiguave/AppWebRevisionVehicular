import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import {
  MultaRtvConsultaService,
  MultaRtvDetalleCompleto,
  MultaRtvResumenFila
} from '../../../services/ant/multa-rtv-consulta.service';

@Component({
  selector: 'app-consulta-multas-rtv-anual',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './consulta-multas-rtv-anual.html',
  styleUrl: './consulta-multas-rtv-anual.css'
})
export class ConsultaMultasRtvAnualComponent implements OnInit {
  cargando = false;
  cargandoDetalle = false;
  filas: MultaRtvResumenFila[] = [];
  detalle: MultaRtvDetalleCompleto | null = null;
  vehiculoIdBusqueda: string = '';

  constructor(
    private service: MultaRtvConsultaService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.detalle = null;
    this.service
      .listarResumen()
      .pipe(catchError(() => of([] as MultaRtvResumenFila[])))
      .subscribe({
        next: (rows) => {
          this.filas = rows ?? [];
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.notification.error('No se pudo cargar el resumen de multas RTV anual.');
          this.filas = [];
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  verDetallePorId(vehiculoId: number): void {
    this.vehiculoIdBusqueda = String(vehiculoId);
    this.buscarDetalle();
  }

  buscarDetalle(): void {
    const id = Number(this.vehiculoIdBusqueda?.trim());
    if (!Number.isFinite(id) || id <= 0) {
      this.notification.error('Ingrese un ID de vehículo válido.');
      return;
    }
    this.cargandoDetalle = true;
    this.detalle = null;
    this.service.obtenerDetallePorVehiculo(id).subscribe({
      next: (d) => {
        this.detalle = d;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 404) {
          this.notification.error('No hay multas RTV anual registradas para ese vehículo.');
        } else {
          this.notification.error('Error al consultar el detalle.');
        }
        this.detalle = null;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      }
    });
  }
}
