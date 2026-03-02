import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css']
})
export class TurnosComponent implements OnInit {
  turnos: Turnos[] = [];
  turnoSeleccionado: Turnos | null = null;
  modoEdicion = false;
  mostrarFormulario = false;

  turnoForm: Turnos = {
    propietarioId: 0,
    vehiculoId: 0,
    servicioId: 0,
    entidadId: 0,
    fechaInicio: '',
    estado: 'GENERADO'
  };

  constructor(
    private turnosService: TurnosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarTurnos();

    // Si viene con queryParams ?nuevo=1 (y opcionalmente IDs), abrir automáticamente el formulario
    this.route.queryParams.subscribe(params => {
      const nuevo = params['nuevo'];
      if (nuevo === '1' || nuevo === 'true') {
        this.nuevoTurno();

        if (params['propietarioId']) {
          this.turnoForm.propietarioId = Number(params['propietarioId']);
        }
        if (params['vehiculoId']) {
          this.turnoForm.vehiculoId = Number(params['vehiculoId']);
        }
        if (params['servicioId']) {
          this.turnoForm.servicioId = Number(params['servicioId']);
        }
        if (params['entidadId']) {
          this.turnoForm.entidadId = Number(params['entidadId']);
        }
      }
    });
  }

  cargarTurnos(): void {
    this.turnosService.getAll().subscribe({
      next: (data) => {
        this.turnos = data;
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
      }
    });
  }

  nuevoTurno(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.turnoForm = {
      propietarioId: 0,
      vehiculoId: 0,
      servicioId: 0,
      entidadId: 0,
      fechaInicio: '',
      estado: 'GENERADO'
    };
  }

  editarTurno(turno: Turnos): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.turnoSeleccionado = turno;
    this.turnoForm = { ...turno };
  }

  guardarTurno(): void {
    if (this.modoEdicion && this.turnoSeleccionado?.turnoId) {
      this.turnosService.update(this.turnoSeleccionado.turnoId, this.turnoForm).subscribe({
        next: () => {
          this.cargarTurnos();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al actualizar turno:', error);
        }
      });
    } else {
      this.turnosService.create(this.turnoForm).subscribe({
        next: () => {
          this.cargarTurnos();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al crear turno:', error);
        }
      });
    }
  }

  eliminarTurno(id: number): void {
    if (confirm('¿Está seguro de eliminar este turno?')) {
      this.turnosService.delete(id).subscribe({
        next: () => {
          this.cargarTurnos();
        },
        error: (error) => {
          console.error('Error al eliminar turno:', error);
        }
      });
    }
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.turnoSeleccionado = null;
  }
}
