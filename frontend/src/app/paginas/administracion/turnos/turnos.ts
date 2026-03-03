import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';
import { Propietario, PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { Servicio } from '../../../services/administracion/servicio.service';

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

  servicios: Servicio[] = [
    { idTipoTramite: 1, nombre: 'Emisión de matrícula por Primera Vez.' },
    { idTipoTramite: 2, nombre: 'Emisión de Documento Anual de Circulación a renovación anual de matrícula.' },
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

  // Selector Propietario (por cédula)
  mostrarModalPropietario = false;
  cargandoPropietarios = false;
  propietariosElegibles: Propietario[] = [];
  busquedaCedula = '';
  propietarioSeleccionadoInfo: Propietario | null = null;

  // Selector Vehículo (por placa)
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  turnoForm: Turnos = {
    propietarioId: 0,
    vehiculoId: 0,
    servicioId: 0,
    fechaInicio: '',
    estado: 'GENERADO'
  };

  constructor(
    private turnosService: TurnosService,
    private propietarioService: PropietarioService,
    private vehiculoService: VehiculoService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
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
          this.cargarPropietarioPorId(this.turnoForm.propietarioId);
        }
        if (params['vehiculoId']) {
          this.turnoForm.vehiculoId = Number(params['vehiculoId']);
          this.cargarVehiculoPorId(this.turnoForm.vehiculoId);
        }
        if (params['servicioId']) {
          this.turnoForm.servicioId = Number(params['servicioId']);
        }
      }
    });
  }

  cargarTurnos(): void {
    this.turnosService.getAll().subscribe({
      next: (data) => {
        this.turnos = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
        this.cdr.detectChanges();
      }
    });
  }

  nuevoTurno(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.propietarioSeleccionadoInfo = null;
    this.vehiculoSeleccionadoInfo = null;
    this.turnoForm = {
      propietarioId: 0,
      vehiculoId: 0,
      servicioId: 0,
      fechaInicio: '',
      estado: 'GENERADO'
    };
  }

  editarTurno(turno: Turnos): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.turnoSeleccionado = turno;
    this.turnoForm = { ...turno };

    this.propietarioSeleccionadoInfo = null;
    this.vehiculoSeleccionadoInfo = null;
    if (this.turnoForm.propietarioId) {
      this.cargarPropietarioPorId(this.turnoForm.propietarioId);
    }
    if (this.turnoForm.vehiculoId) {
      this.cargarVehiculoPorId(this.turnoForm.vehiculoId);
    }
  }

  guardarTurno(): void {
    if (!this.turnoForm.propietarioId || this.turnoForm.propietarioId <= 0) {
      alert('Debe seleccionar un propietario por cédula');
      return;
    }
    if (!this.turnoForm.vehiculoId || this.turnoForm.vehiculoId <= 0) {
      alert('Debe seleccionar un vehículo por placa');
      return;
    }
    if (!this.turnoForm.servicioId || this.turnoForm.servicioId <= 0) {
      alert('Debe seleccionar un servicio');
      return;
    }
    if (!this.turnoForm.fechaInicio) {
      alert('La fecha de inicio es requerida');
      return;
    }

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

  // =======================
  // Propietario
  // =======================
  abrirSelectorPropietario(): void {
    this.mostrarModalPropietario = true;
    this.busquedaCedula = this.propietarioSeleccionadoInfo?.documentoIdentidad ?? this.busquedaCedula;
    this.buscarPropietariosElegibles();
  }

  cerrarSelectorPropietario(): void {
    this.mostrarModalPropietario = false;
  }

  buscarPropietariosElegibles(): void {
    this.cargandoPropietarios = true;
    this.propietariosElegibles = [];

    this.propietarioService.listarElegibles(this.busquedaCedula).subscribe({
      next: (data) => {
        this.propietariosElegibles = data ?? [];
        this.cargandoPropietarios = false;
      },
      error: (err) => {
        console.error('Error al buscar propietarios elegibles:', err);
        this.cargandoPropietarios = false;
      }
    });
  }

  seleccionarPropietario(p: Propietario): void {
    this.propietarioSeleccionadoInfo = p;
    this.turnoForm.propietarioId = (p.idPropietario ?? 0) as number;
    this.cerrarSelectorPropietario();
  }

  limpiarPropietario(): void {
    this.propietarioSeleccionadoInfo = null;
    this.turnoForm.propietarioId = 0;
  }

  private cargarPropietarioPorId(id: number): void {
    if (!id || id <= 0) return;
    this.propietarioService.obtenerPorId(id).subscribe({
      next: (p) => (this.propietarioSeleccionadoInfo = p),
      error: (err) => console.warn('No se pudo cargar propietario por ID:', err)
    });
  }

  // =======================
  // Vehículo
  // =======================
  abrirSelectorVehiculo(): void {
    this.mostrarModalVehiculo = true;
    this.busquedaPlaca = this.vehiculoSeleccionadoInfo?.matricula ?? this.busquedaPlaca;
    this.buscarVehiculos();
  }

  cerrarSelectorVehiculo(): void {
    this.mostrarModalVehiculo = false;
  }

  buscarVehiculos(): void {
    this.cargandoVehiculos = true;
    this.vehiculosEncontrados = [];

    this.vehiculoService.buscarPorPlaca(this.busquedaPlaca).subscribe({
      next: (data) => {
        this.vehiculosEncontrados = data ?? [];
        this.cargandoVehiculos = false;
      },
      error: (err) => {
        console.error('Error al buscar vehículos:', err);
        this.cargandoVehiculos = false;
      }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    this.vehiculoSeleccionadoInfo = v;
    this.turnoForm.vehiculoId = (v.id ?? 0) as number;
    this.cerrarSelectorVehiculo();
  }

  limpiarVehiculo(): void {
    this.vehiculoSeleccionadoInfo = null;
    this.turnoForm.vehiculoId = 0;
  }

  private cargarVehiculoPorId(id: number): void {
    if (!id || id <= 0) return;
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v) => (this.vehiculoSeleccionadoInfo = v),
      error: (err) => console.warn('No se pudo cargar vehículo por ID:', err)
    });
  }
}
