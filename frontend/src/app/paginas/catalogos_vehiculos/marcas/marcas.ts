import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarcaVehiculoService, MarcaVehiculo } from '../../../services/catalogos_vehiculos/marcas.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-marca-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './marcas.html',
  styleUrl: './marcas.css',
})
export class MarcaVehiculoComponent implements OnInit {
  marcas: MarcaVehiculo[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  marcaEditando: MarcaVehiculo = {
    id: null,
    nombre: '',
    empresa: '',
    paisOrigen: '',
    grupoAutomotriz: '',
    fechaAlta: null,
    fechaBaja: null,
    logoUrl: '',
    estado: 'A'
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  marcaDetalle: MarcaVehiculo | null = null;

  constructor(private marcaService: MarcaVehiculoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas(): void {
    this.cargando = true;
    this.marcaService.listarMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar datos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get marcasFiltradas(): MarcaVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.marcas.filter(m =>
      m.nombre.toLowerCase().includes(f) ||
      m.empresa.toLowerCase().includes(f) ||
      m.paisOrigen.toLowerCase().includes(f) ||
      m.grupoAutomotriz.toLowerCase().includes(f) ||
      (m.id?.toString() || '').includes(f)
    );
  }

  get marcasPaginadas(): MarcaVehiculo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.marcasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.marcasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void {
    this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.marcaEditando = {
      id: null,
      nombre: '',
      empresa: '',
      paisOrigen: '',
      grupoAutomotriz: '',
      fechaAlta: null,
      fechaBaja: null,
      logoUrl: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(marca: MarcaVehiculo): void {
    this.modoEdicion = true;
    this.marcaEditando = { ...marca };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarMarca(): void {
    if (!this.marcaEditando.nombre.trim()) {
      alert('El nombre de la marca es obligatorio');
      return;
    }

    this.guardando = true;
    const idValue = this.marcaEditando.id;

    if (this.modoEdicion && idValue) {
      this.marcaService.actualizarMarca(idValue, this.marcaEditando).subscribe({
        next: () => {
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al actualizar');
        }
      });
    } else {
      this.marcaService.crearMarca(this.marcaEditando).subscribe({
        next: () => {
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al crear');
        }
      });
    }
  }

  verDetalle(marca: MarcaVehiculo): void {
    this.marcaDetalle = marca;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
