import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoriasService, Subcategoria, Categoria } from '../../../services/catalogos_vehiculos/subcategorias.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './subcategorias.html',
  styleUrl: './subcategorias.css',
})
export class SubcategoriasComponent implements OnInit {
  subcategorias: Subcategoria[] = [];
  categorias: Categoria[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  subcategoriaEditando: Subcategoria = {
    id: null,
    codigoSubcategoria: '',
    nombre: '',
    descripcion: '',
    estado: 'A',
    categoriaId: 0
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  subcategoriaDetalle: Subcategoria | null = null;

  constructor(
    private subcategoriasService: SubcategoriasService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /** Cargar subcategorías y categorías */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Cargar categorías primero
    this.subcategoriasService.listarCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(c => c.estado === 'A'); // Solo activas

        // Luego cargar subcategorías
        this.subcategoriasService.listar().subscribe({
          next: (subcategorias) => {
            console.log('Subcategorías cargadas:', subcategorias);
            // Enriquecer subcategorías con código de categoría
            this.subcategorias = subcategorias.map(sub => ({
              ...sub,
              codigo: this.obtenerCodigoCategoria(sub.categoriaId)
            }));
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar subcategorías:', err);
            this.error = 'Error al cargar las subcategorías. Verifica que el backend esté corriendo.';
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error = 'Error al cargar las categorías. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Obtener código de categoría por ID */
  obtenerCodigoCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.categoriaid === categoriaId);
    return categoria ? categoria.codigo : 'Sin categoría';
  }

  /** Obtener nombre de categoría por ID (para tooltip o detalle) */
  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.categoriaid === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  /** Filtrar subcategorías */
  get subcategoriasFiltradas(): Subcategoria[] {
    if (!this.filtro.trim()) {
      return this.subcategorias;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.subcategorias.filter(
      (sub) =>
        sub.codigoSubcategoria.toLowerCase().includes(filtroLower) ||
        sub.nombre.toLowerCase().includes(filtroLower) ||
        sub.descripcion.toLowerCase().includes(filtroLower) ||
        (sub.codigo || '').toLowerCase().includes(filtroLower) ||
        this.getEstadoTexto(sub.estado).toLowerCase().includes(filtroLower)
    );
  }

  /** Subcategorías paginadas */
  get subcategoriasPaginadas(): Subcategoria[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.subcategoriasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.subcategoriasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  /** Abrir modal crear */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.subcategoriaEditando = {
      id: null,
      codigoSubcategoria: '',
      nombre: '',
      descripcion: '',
      estado: 'A',
      categoriaId: this.categorias.length > 0 ? this.categorias[0].categoriaid : 0
    };
    this.mostrarModalForm = true;
  }

  /** Abrir modal editar */
  abrirModalEditar(subcategoria: Subcategoria): void {
    this.modoEdicion = true;
    this.subcategoriaEditando = { ...subcategoria };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  /** Guardar subcategoría */
  guardarSubcategoria(): void {
    // Validaciones
    if (!this.subcategoriaEditando.codigoSubcategoria.trim()) {
      this.notification.error('El código de la subcategoría es requerido');
      return;
    }
    if (!this.subcategoriaEditando.nombre.trim()) {
      this.notification.error('El nombre de la subcategoría es requerido');
      return;
    }
    if (!this.subcategoriaEditando.categoriaId || this.subcategoriaEditando.categoriaId === 0) {
      this.notification.error('Debe seleccionar una categoría');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.subcategoriaEditando.id) {
      // Editar
      this.subcategoriasService.actualizar(
        this.subcategoriaEditando.id,
        this.subcategoriaEditando
      ).subscribe({
        next: (response) => {
          console.log('Subcategoría actualizada:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al actualizar subcategoría:', err);
          this.notification.error('Error al actualizar la subcategoría');
          this.guardando = false;
        }
      });
    } else {
      // Crear (sin enviar ID)
      const nuevaSubcategoria = {
        codigoSubcategoria: this.subcategoriaEditando.codigoSubcategoria,
        nombre: this.subcategoriaEditando.nombre,
        descripcion: this.subcategoriaEditando.descripcion,
        estado: this.subcategoriaEditando.estado,
        categoriaId: this.subcategoriaEditando.categoriaId
      };

      this.subcategoriasService.crear(nuevaSubcategoria as Subcategoria).subscribe({
        next: (response) => {
          console.log('Subcategoría creada:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al crear subcategoría:', err);
          this.notification.error('Error al crear la subcategoría');
          this.guardando = false;
        }
      });
    }
  }

  /** Ver detalle */
  verDetalle(subcategoria: Subcategoria): void {
    this.subcategoriaDetalle = subcategoria;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.subcategoriaDetalle = null;
  }
}
