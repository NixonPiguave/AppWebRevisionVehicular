import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { VehiculoService, Vehiculo } from '../../../services/gestion_vehicular/vehiculo.service';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css'
})
export class VehiculoComponent implements OnInit {

  vehiculos: Vehiculo[] = [];

  cargando = false;
  error = '';
  filtro = '';

  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  vehiculoEditando: Vehiculo = this.vehiculoVacio();

  mostrarModalDetalle = false;
  vehiculoDetalle: Vehiculo | null = null;

  constructor(
    private vehiculoService: VehiculoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private vehiculoVacio(): Vehiculo {
    return {
      id: null,
      propietarioId: 0,
      matricula: '',
      chasis: '',
      vin: '',
      modeloVehiculoId: 0,
      anioFabricacion: new Date().getFullYear(),
      color: '',
      estado: 'A',
      capacidadPasajeros: 0,
      tipoVehiculoId: 0,
      capCargaId: 0,
      ambitoOperacionalId: 0,
      ejesId: 0,
      traccionId: 0,
      tipoCombustibleId: 0,
      tipoMatriculaId: 0,
      subcategoriaId: 0
    };
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.vehiculoService.listar().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los vehículos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get vehiculosFiltrados(): Vehiculo[] {
    if (!this.filtro.trim()) return this.vehiculos;

    const f = this.filtro.toLowerCase();
    return this.vehiculos.filter(v =>
      v.matricula.toLowerCase().includes(f) ||
      v.chasis.toLowerCase().includes(f) ||
      v.vin.toLowerCase().includes(f) ||
      v.color.toLowerCase().includes(f) ||
      v.anioFabricacion.toString().includes(f) ||
      this.getEstadoTexto(v.estado).toLowerCase().includes(f)
    );
  }

  get vehiculosPaginados(): Vehiculo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.vehiculosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.vehiculosFiltrados.length / this.registrosPorPagina);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.vehiculoEditando = this.vehiculoVacio();
    this.mostrarModalForm = true;
  }

  abrirModalEditar(vehiculo: Vehiculo): void {
    this.modoEdicion = true;
    this.vehiculoEditando = { ...vehiculo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardar(): void {
    if (!this.vehiculoEditando.chasis.trim()) {
      alert('El chasis es obligatorio');
      return;
    }

    if (!this.vehiculoEditando.vin.trim()) {
      alert('El VIN es obligatorio');
      return;
    }

    if (!this.vehiculoEditando.matricula.trim()) {
      alert('La matrícula es obligatoria');
      return;
    }

    if (this.vehiculoEditando.capacidadPasajeros <= 0) {
      alert('La capacidad de pasajeros debe ser mayor a 0');
      return;
    }

    if (!this.vehiculoEditando.tipoVehiculoId) {
      alert('Debe seleccionar un tipo de vehículo');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.vehiculoEditando.id) {

      this.vehiculoService.actualizar(
        this.vehiculoEditando.id,
        this.vehiculoEditando
      ).subscribe({
        next: () => {
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          alert('Error al actualizar el vehículo');
          this.guardando = false;
        }
      });

    } else {

      const nuevo: Vehiculo = { ...this.vehiculoEditando, id: null };

      this.vehiculoService.crear(nuevo).subscribe({
        next: () => {
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          alert('Error al crear el vehículo');
          this.guardando = false;
        }
      });
    }
  }

  verDetalle(vehiculo: Vehiculo): void {
    this.vehiculoDetalle = vehiculo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.vehiculoDetalle = null;
  }
}
