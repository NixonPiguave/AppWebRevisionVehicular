import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MetodoInspeccionService, MetodoInspeccion } from '../../../services/inspeccion_rtv/metodo_inspeccion.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metodo-inspeccion',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './metodo-inspeccion.html',
  styleUrl: './metodo-inspeccion.css',
})
export class MetodoInspeccionComponent implements OnInit {
  // Lista de métodos de inspección (se carga desde el backend)
  metodosInspeccion: MetodoInspeccion[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  metodoEditando: MetodoInspeccion = {
    metodoInspeccionId: null,
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  metodoDetalle: MetodoInspeccion | null = null;

  constructor(
    private metodoInspeccionService: MetodoInspeccionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMetodosInspeccion();
  }

  /**
   * Cargar métodos de inspección desde el backend
   */
  cargarMetodosInspeccion(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.metodoInspeccionService.listarMetodosInspeccion().subscribe({
      next: (data) => {
        console.log('Métodos de inspección cargados:', data);
        this.metodosInspeccion = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar métodos de inspección:', err);
        this.error = 'Error al cargar los métodos de inspección. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para métodos filtrados
  get metodosFiltrados(): MetodoInspeccion[] {
    if (!this.filtro.trim()) {
      return this.metodosInspeccion;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.metodosInspeccion.filter(
      (metodo) =>
        metodo.nombre.toLowerCase().includes(filtroLower) ||
        metodo.descripcion.toLowerCase().includes(filtroLower) ||
        (metodo.metodoInspeccionId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(metodo.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para métodos paginados
  get metodosPaginados(): MetodoInspeccion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.metodosFiltrados.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.metodosFiltrados.length / this.registrosPorPagina);
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
    this.metodoEditando = {
      metodoInspeccionId: null,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(metodo: MetodoInspeccion): void {
    this.modoEdicion = true;
    this.metodoEditando = { ...metodo };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.metodoEditando = {
      metodoInspeccionId: null,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }

  // Guardar método de inspección (crear o editar)
  guardarMetodoInspeccion(): void {
    if (!this.metodoEditando.nombre.trim()) {
      alert('El nombre del método de inspección es requerido');
      return;
    }

    if (!this.metodoEditando.descripcion.trim()) {
      alert('La descripción del método de inspección es requerida');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.metodoEditando.metodoInspeccionId) {
      // Editar existente
      this.metodoInspeccionService.actualizarMetodoInspeccion(
        this.metodoEditando.metodoInspeccionId,
        this.metodoEditando
      ).subscribe({
        next: () => {
          this.cargarMetodosInspeccion();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar método de inspección:', err);
          alert('Error al actualizar el método de inspección');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.metodoInspeccionService.crearMetodoInspeccion(this.metodoEditando).subscribe({
        next: () => {
          this.cargarMetodosInspeccion();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear método de inspección:', err);
          alert('Error al crear el método de inspección');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(metodo: MetodoInspeccion): void {
    this.metodoDetalle = metodo;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.metodoDetalle = null;
  }
}
