import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AreasService, Area } from '../../../services/areas.service';

@Component({
  selector: 'app-areas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './areas.html',
  styleUrl: './areas.css',
})
export class AreasComponent implements OnInit {
  // Lista de áreas (se carga desde el backend)
  areas: Area[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  areaEditando: Area = { areaId: null, nombre: '', estado: 'A' };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  areaDetalle: Area | null = null;

  constructor(
    private areasService: AreasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAreas();
  }

  /**
   * Cargar áreas desde el backend
   */
  cargarAreas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.areasService.listarAreas().subscribe({
      next: (data) => {
        console.log('Áreas cargadas:', data);
        this.areas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar áreas:', err);
        this.error = 'Error al cargar las áreas. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para áreas filtradas
  get areasFiltradas(): Area[] {
    if (!this.filtro.trim()) {
      return this.areas;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.areas.filter(
      (area) =>
        area.nombre.toLowerCase().includes(filtroLower) ||
        (area.areaId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(area.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para áreas paginadas
  get areasPaginadas(): Area[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.areasFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.areasFiltradas.length / this.registrosPorPagina);
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
    this.areaEditando = { areaId: null, nombre: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(area: Area): void {
    this.modoEdicion = true;
    this.areaEditando = { ...area };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.areaEditando = { areaId: null, nombre: '', estado: 'A' };
  }

  // Guardar área (crear o editar)
  guardarArea(): void {
    if (!this.areaEditando.nombre.trim()) {
      alert('El nombre del área es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.areaEditando.areaId) {
      // Editar existente
      this.areasService.actualizarArea(this.areaEditando.areaId, this.areaEditando).subscribe({
        next: () => {
          this.cargarAreas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar área:', err);
          alert('Error al actualizar el área');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.areasService.crearArea(this.areaEditando).subscribe({
        next: () => {
          this.cargarAreas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear área:', err);
          alert('Error al crear el área');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(area: Area): void {
    this.areaDetalle = area;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.areaDetalle = null;
  }
}
