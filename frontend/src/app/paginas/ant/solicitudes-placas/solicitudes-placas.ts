import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../../../services/notification.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import {
  SolicitudesPlacasAntService,
  SolicitudPlacasAnt,
  PlacaDisponible
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
  placasDisponibles: PlacaDisponible[] = [];

  /** Dirección de la empresa (referencia para la letra de provincia). */
  direccionEmpresa = '';

  // Form nueva solicitud
  cantidad = 10;
  /** Primera letra alfabética de la dirección de la empresa (autollenado). */
  letraProvincia = '';
  tipoServicio = 'PARTICULAR';

  constructor(
    private service: SolicitudesPlacasAntService,
    private empresaService: EmpresaService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refrescarTodo();
  }

  /** Carga empresa (provincia), solicitudes pendientes e inventario de placas. */
  refrescarTodo(): void {
    this.cargando = true;
    forkJoin({
      empresa: this.empresaService.obtenerPrimera().pipe(catchError(() => of(null))),
      solicitudes: this.service.listar('PENDIENTE').pipe(catchError(() => of([]))),
      placas: this.service.listarPlacasDisponibles().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ empresa, solicitudes, placas }) => {
        this.direccionEmpresa = (empresa?.direccion ?? '').trim();
        const letra = this.extraerPrimeraLetraAlfabetica(this.direccionEmpresa);
        this.letraProvincia = letra || 'P';
        this.solicitudes = solicitudes ?? [];
        this.placasDisponibles = placas ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Error al cargar datos.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Primera letra A-Z de la dirección (ignora números, espacios y símbolos hasta la primera letra).
   */
  private extraerPrimeraLetraAlfabetica(direccion: string): string {
    const s = (direccion || '').trim();
    for (const ch of s) {
      if (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ch)) return ch.toUpperCase();
    }
    return '';
  }

  crearSolicitud(): void {
    if (!this.cantidad || this.cantidad <= 0) {
      this.notification.error('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!this.letraProvincia?.trim()) {
      this.notification.error('No se pudo determinar la letra de provincia. Revise la dirección de la empresa.');
      return;
    }
    if (!this.tipoServicio?.trim()) {
      this.notification.error('Debe indicar el tipo de servicio.');
      return;
    }
    this.service.crear(this.cantidad, this.letraProvincia, this.tipoServicio).subscribe({
      next: () => {
        this.notification.success('Solicitud creada (PENDIENTE).');
        this.refrescarTodo();
      },
      error: () => this.notification.error('No se pudo crear la solicitud.')
    });
  }

  recibir(s: SolicitudPlacasAnt): void {
    this.service.recibir(s.idSolicitud).subscribe({
      next: (placas) => {
        this.notification.success(`Placas recibidas: ${placas?.length ?? 0}`);
        this.refrescarTodo();
      },
      error: () => this.notification.error('No se pudo recibir la solicitud.')
    });
  }
}
