import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';
import {
  SolicitudesPlacasAntService,
  SolicitudPlacasAnt
} from '../../../services/ant/solicitudes-placas-ant.service';

@Component({
  selector: 'app-solicitudes-placas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './solicitudes-placas.html',
  styleUrl: './solicitudes-placas.css'
})
export class SolicitudesPlacasComponent implements OnInit {
  cargando = false;
  solicitudes: SolicitudPlacasAnt[] = [];

  // Form nueva solicitud
  cantidad = 10;
  letraProvincia = 'P';
  tipoServicio = 'PARTICULAR';

  constructor(
    private service: SolicitudesPlacasAntService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.cargando = true;
    this.solicitudes = [];
    this.service.listar('PENDIENTE').subscribe({
      next: (data) => {
        this.solicitudes = data ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('No se pudieron cargar las solicitudes pendientes.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearSolicitud(): void {
    if (!this.cantidad || this.cantidad <= 0) {
      this.notification.error('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!this.letraProvincia?.trim()) {
      this.notification.error('Debe indicar la provincia.');
      return;
    }
    if (!this.tipoServicio?.trim()) {
      this.notification.error('Debe indicar el tipo de servicio.');
      return;
    }
    this.service.crear(this.cantidad, this.letraProvincia, this.tipoServicio).subscribe({
      next: () => {
        this.notification.success('Solicitud creada (PENDIENTE).');
        this.cargarPendientes();
      },
      error: () => this.notification.error('No se pudo crear la solicitud.')
    });
  }

  recibir(s: SolicitudPlacasAnt): void {
    this.service.recibir(s.idSolicitud).subscribe({
      next: (placas) => {
        this.notification.success(`Placas recibidas: ${placas?.length ?? 0}`);
        this.cargarPendientes(); // ya no se muestra porque queda RECIBIDO
      },
      error: () => this.notification.error('No se pudo recibir la solicitud.')
    });
  }
}

