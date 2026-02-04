import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CapacidadCargaService, CapacidadCarga } from '../../../services/catalogos_vehiculos/capacidad_carga.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-capacidad-carga',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './capacidad-carga.html',
  styleUrl: './capacidad-carga.css',
})
export class CapacidadCargaComponent implements OnInit {
  // Lista de capacidades de carga
  capacidades: CapacidadCarga[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  capacidadEditando: CapacidadCarga = { capacidadCargaId: null, capacidad: '', descripcion: '', estado: 'A', unidad: '' };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  capacidadDetalle: CapacidadCarga | null = null;

  constructor(
    private capacidadService: CapacidadCargaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCapacidades();
  }

  /** Cargar capacidades de carga desde el backend */
  cargarCapacidades(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.capacidadService.listarCapacidadesCarga().subscribe({
      next: (data) => {
        console.log('Capacidades de carga cargadas:', data);
        this.capacidades = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar capacidades de carga:', err);
        this.error = 'Error al cargar las capacidades de carga. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para capacidades filtradas
  get capacidadesFiltradas(): CapacidadCarga[] {
    if (!this.filtro.trim()) {
      return this.capacidades;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.capacidades.filter(
      (capacidad) =>
        capacidad.capacidad.toLowerCase().includes(filtroLower) ||
        capacidad.descripcion.toLowerCase().includes(filtroLower) ||
        capacidad.unidad.toLowerCase().includes(filtroLower) ||
        (capacidad.capacidadCargaId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(capacidad.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para capacidades paginadas
  get capacidadesPaginadas(): CapacidadCarga[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.capacidadesFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.capacidadesFiltradas.length / this.registrosPorPagina);
  }

  // Getter para array de páginas
  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Convertir estado a texto
  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  // Cambiar página
  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Reset página al cambiar filtro o registros por página
  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  // Abrir modal para crear
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.capacidadEditando = { capacidadCargaId: null, capacidad: '', descripcion: '', estado: 'A', unidad: '' };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(capacidad: CapacidadCarga): void {
    this.modoEdicion = true;
    this.capacidadEditando = { ...capacidad };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.capacidadEditando = { capacidadCargaId: null, capacidad: '', descripcion: '', estado: 'A', unidad: '' };
  }

  // Guardar capacidad (crear o editar)
  guardarCapacidad(): void {
    if (!this.capacidadEditando.capacidad.trim()) {
      alert('El nombre de la capacidad de carga es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.capacidadEditando.capacidadCargaId) {
      // Editar existente
      this.capacidadService.actualizarCapacidadCarga(this.capacidadEditando.capacidadCargaId, this.capacidadEditando).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar capacidad de carga:', err);
          alert('Error al actualizar la capacidad de carga');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.capacidadService.crearCapacidadCarga(this.capacidadEditando).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear capacidad de carga:', err);
          alert('Error al crear la capacidad de carga');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(capacidad: CapacidadCarga): void {
    this.capacidadDetalle = capacidad;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.capacidadDetalle = null;
  }
}
