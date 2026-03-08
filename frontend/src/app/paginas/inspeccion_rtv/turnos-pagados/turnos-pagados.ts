import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import { NotificationService } from '../../../services/notification.service';
import { obtenerRutaPorMetodo } from '../../../config/metodo-inspeccion-routes.config';

@Component({
  selector: 'app-turnos-pagados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos-pagados.html',
  styleUrl: './turnos-pagados.css'
})
export class TurnosPagadosComponent implements OnInit {

  turnos: Turnos[] = [];
  cargando = false;
  error = '';

  mostrarModal = false;
  turnoSeleccionado: Turnos | null = null;
  metodosPendientes: { id: number; nombre: string }[] = [];
  cargandoMetodos = false;

  servicios: Servicio[] = [];

  constructor(
    private turnosService: TurnosService,
    private servicioService: ServicioService,
    private router: Router,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarTurnosPagados();
  }

  cargarServicios(): void {
    this.servicioService.listar().subscribe({
      next: (data) => { this.servicios = data ?? []; this.cdr.detectChanges(); },
      error: () => { this.servicios = []; this.cdr.detectChanges(); }
    });
  }

  cargarTurnosPagados(): void {
    this.cargando = true;
    this.error = '';
    this.turnosService.getPagados().subscribe({
      next: (data: Turnos[]) => {
        this.turnos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar turnos pagados:', err);
        this.error = 'No se pudieron cargar los turnos pagados.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getNombreServicio(servicioId: number): string {
    const s = this.servicios.find(x => x.idTipoTramite === servicioId);
    return s?.nombre ?? `Servicio #${servicioId}`;
  }

  abrirModalMetodos(turno: Turnos): void {
    const vehiculoId = (turno as any).vehiculoId ?? (turno as any).vehiculo?.id;
    if (!turno.turnoId || !vehiculoId) {
      this.notification.error('Este turno no tiene vehículo asociado.');
      return;
    }
    this.turnoSeleccionado = turno;
    this.mostrarModal = true;
    this.metodosPendientes = [];
    this.cargandoMetodos = true;
    this.turnosService.getMetodosInspeccionPendientes(turno.turnoId!).subscribe({
      next: (metodos) => {
        this.metodosPendientes = metodos;
        this.cargandoMetodos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar métodos pendientes:', err);
        this.notification.error('No se pudieron cargar los métodos de inspección pendientes.');
        this.cargandoMetodos = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.turnoSeleccionado = null;
    this.metodosPendientes = [];
  }

  seleccionarMetodo(metodo: { id: number; nombre: string }): void {
    if (!this.turnoSeleccionado) return;
    const vehiculoId = (this.turnoSeleccionado as any).vehiculoId ?? (this.turnoSeleccionado as any).vehiculo?.id;
    const turnoId = this.turnoSeleccionado.turnoId;

    const ruta = obtenerRutaPorMetodo(metodo.nombre) ?? '/inicio/inspeccion-rtv/registrar';

    this.cerrarModal();

    const params = new URLSearchParams({
      turnoId: String(turnoId),
      vehiculoId: String(vehiculoId),
      metodoInspeccionId: String(metodo.id)
    });
    this.router.navigateByUrl(`${ruta}?${params.toString()}`);
  }

  volver(): void {
    this.router.navigate(['/inicio']);
  }
}
