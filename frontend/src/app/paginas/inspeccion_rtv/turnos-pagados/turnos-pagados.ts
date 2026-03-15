import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import { LineasService, Linea } from '../../../services/inspeccion_rtv/lineas.service';
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

  lineas: Linea[] = [];
  lineaSeleccionada: Linea | null = null;
  cargandoLineas = false;

  mostrarModal = false;
  turnoSeleccionado: Turnos | null = null;
  metodosPendientes: { id: number; nombre: string }[] = [];
  cargandoMetodos = false;

  servicios: Servicio[] = [];

  constructor(
    private turnosService: TurnosService,
    private servicioService: ServicioService,
    private lineasService: LineasService,
    private router: Router,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarLineas();
  }

  cargarServicios(): void {
    this.servicioService.listar().subscribe({
      next: (data) => { this.servicios = data ?? []; this.cdr.detectChanges(); },
      error: () => { this.servicios = []; this.cdr.detectChanges(); }
    });
  }

  cargarLineas(): void {
    this.cargandoLineas = true;
    this.lineasService.listarRoles().subscribe({
      next: (data) => {
        this.lineas = data ?? [];
        this.cargandoLineas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.lineas = [];
        this.cargandoLineas = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarLinea(linea: Linea): void {
    this.lineaSeleccionada = linea;
    this.cargarTurnosPagados();
    this.cdr.detectChanges();
  }

  cargarTurnosPagados(): void {
    if (!this.lineaSeleccionada?.id) {
      this.turnos = [];
      this.cdr.detectChanges();
      return;
    }
    this.cargando = true;
    this.error = '';
    this.turnosService.getPagados(undefined, this.lineaSeleccionada.id).subscribe({
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
    const lineaId = this.lineaSeleccionada?.id;

    const ruta = obtenerRutaPorMetodo(metodo.nombre) ?? '/inicio/inspeccion-rtv/registrar';

    this.cerrarModal();

    const params = new URLSearchParams({
      turnoId: String(turnoId),
      vehiculoId: String(vehiculoId),
      metodoInspeccionId: String(metodo.id)
    });
    if (lineaId != null) params.set('lineaId', String(lineaId));
    this.router.navigateByUrl(`${ruta}?${params.toString()}`);
  }

  volver(): void {
    this.router.navigate(['/inicio']);
  }
}
