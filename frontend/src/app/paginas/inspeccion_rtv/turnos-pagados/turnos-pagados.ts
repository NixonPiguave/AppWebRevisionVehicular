import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';

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

  servicios: { idTipoTramite: number; nombre: string }[] = [
    { idTipoTramite: 1, nombre: 'Emisión de matrícula por Primera Vez.' },
    { idTipoTramite: 2, nombre: 'Emisión de Documento Anual de Circulación' },
    { idTipoTramite: 3, nombre: 'Duplicado de Documento de Matrícula.' },
    { idTipoTramite: 4, nombre: 'Duplicado del Documento Anual de Circulación.' },
    { idTipoTramite: 5, nombre: 'Transferencia de Dominio.' },
    { idTipoTramite: 6, nombre: 'Cambio de Servicio.' },
    { idTipoTramite: 7, nombre: 'Matriculación de Unidades de Carga' },
    { idTipoTramite: 8, nombre: 'Cambio de Características' },
    { idTipoTramite: 9, nombre: 'Bloqueo de vehículo' },
    { idTipoTramite: 10, nombre: 'Desbloqueo de vehículo' },
    { idTipoTramite: 11, nombre: 'Registro de Observaciones' },
    { idTipoTramite: 12, nombre: 'Baja de vehículos' },
    { idTipoTramite: 13, nombre: 'Registro de Incidentes' },
    { idTipoTramite: 14, nombre: 'Anulación de Trámites' },
    { idTipoTramite: 15, nombre: 'Registro de vehículos en la Base Única Nacional de Datos.' },
    { idTipoTramite: 16, nombre: 'Casos especiales detectados en procesos de matriculación' }
  ];

  constructor(
    private turnosService: TurnosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTurnosPagados();
  }

  cargarTurnosPagados(): void {
    this.cargando = true;
    this.error = '';
    this.turnosService.getPagados().subscribe({
      next: (data) => {
        this.turnos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar turnos pagados:', err);
        this.error = 'No se pudieron cargar los turnos pagados.';
        this.cargando = false;
      }
    });
  }

  getNombreServicio(servicioId: number): string {
    const s = this.servicios.find(x => x.idTipoTramite === servicioId);
    return s ? s.nombre : `Servicio #${servicioId}`;
  }

  iniciarInspeccion(turno: Turnos): void {
    const vehiculoId = (turno as any).vehiculoId ?? (turno as any).vehiculo?.id;
    if (!turno.turnoId || !vehiculoId) {
      alert('Este turno no tiene vehículo asociado.');
      return;
    }
    this.router.navigate(['/inicio/inspeccion-rtv/registrar'], {
      queryParams: { turnoId: turno.turnoId, vehiculoId }
    });
  }

  volver(): void {
    this.router.navigate(['/inicio']);
  }
}
