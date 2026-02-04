import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaDefectoService, CategoriaDefecto } from '../../../services/defectos_inspeccion/categoria_defecto.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-categoria-defecto',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './categoria-defecto.html',
  styleUrl: './categoria-defecto.css',
})
export class CategoriaDefectoComponent implements OnInit {
  // Lista de categorías de defecto (se carga desde el backend)
  categorias: CategoriaDefecto[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  categoriaEditando: CategoriaDefecto = {
    rtvcategoriaId: null,
    subfamiliaId: 0,
    codigo: '',
    estado: 'A',
    nombre: '',
    descripcion: ''
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  categoriaDetalle: CategoriaDefecto | null = null;

  constructor(
    private categoriaDefectoService: CategoriaDefectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  /**
   * Cargar categorías desde el backend
   */
  cargarCategorias(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.categoriaDefectoService.listarCategorias().subscribe({
      next: (data) => {
        console.log('Categorías de defecto cargadas:', data);
        this.categorias = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error = 'Error al cargar las categorías de defecto. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para categorías filtradas
  get categoriasFiltradas(): CategoriaDefecto[] {
    if (!this.filtro.trim()) {
      return this.categorias;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.categorias.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(filtroLower) ||
        categoria.codigo.toLowerCase().includes(filtroLower) ||
        categoria.descripcion.toLowerCase().includes(filtroLower) ||
        (categoria.rtvcategoriaId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(categoria.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para categorías paginadas
  get categoriasPaginadas(): CategoriaDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.categoriasFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.registrosPorPagina);
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
    this.categoriaEditando = {
      rtvcategoriaId: null,
      subfamiliaId: 0,
      codigo: '',
      estado: 'A',
      nombre: '',
      descripcion: ''
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(categoria: CategoriaDefecto): void {
    this.modoEdicion = true;
    this.categoriaEditando = { ...categoria };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.categoriaEditando = {
      rtvcategoriaId: null,
      subfamiliaId: 0,
      codigo: '',
      estado: 'A',
      nombre: '',
      descripcion: ''
    };
  }

  // Guardar categoría (crear o editar)
  guardarCategoria(): void {
    if (!this.categoriaEditando.nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }
    if (!this.categoriaEditando.codigo.trim()) {
      alert('El código es requerido');
      return;
    }
    if (!this.categoriaEditando.subfamiliaId || this.categoriaEditando.subfamiliaId === 0) {
      alert('La subfamilia es requerida');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.categoriaEditando.rtvcategoriaId) {
      // Editar existente
      this.categoriaDefectoService.actualizarCategoria(
        this.categoriaEditando.rtvcategoriaId,
        this.categoriaEditando
      ).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar categoría:', err);
          alert('Error al actualizar la categoría de defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.categoriaDefectoService.crearCategoria(this.categoriaEditando).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear categoría:', err);
          alert('Error al crear la categoría de defecto');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(categoria: CategoriaDefecto): void {
    this.categoriaDetalle = categoria;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.categoriaDetalle = null;
  }
}
