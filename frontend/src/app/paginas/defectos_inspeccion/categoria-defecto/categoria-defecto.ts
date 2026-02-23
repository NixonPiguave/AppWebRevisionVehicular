import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaDefectoService, CategoriaDefecto, SubfamiliaDefecto } from '../../../services/defectos_inspeccion/categoria_defecto.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-categoria-defecto',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './categoria-defecto.html',
  styleUrl: './categoria-defecto.css',
})
export class CategoriaDefectoComponent implements OnInit {
  categorias: CategoriaDefecto[] = [];
  subfamilias: SubfamiliaDefecto[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtro y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  categoriaEditando: CategoriaDefecto = this.getCategoriaVacia();
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  categoriaDetalle: CategoriaDefecto | null = null;

  constructor(
    private categoriaService: CategoriaDefectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  getCategoriaVacia(): CategoriaDefecto {
    return {
      id: null,
      subfamiliaId: 0,
      codigo: '',
      estado: 'A',
      nombre: '',
      descripcion: ''
    };
  }


   //Cargar categorías y subfamilias
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.categoriaService.listarSubfamilias().subscribe({
      next: (subfamilias) => {

        // SOLO ACTIVAS
        this.subfamilias = subfamilias.filter(s => s.estado === 'A');

        console.log('[CATEGORIAS] Subfamilias activas cargadas:', this.subfamilias);

        // Luego cargar categorías
        this.cargarCategorias();
      },
      error: (err) => {
        console.error('[CATEGORIAS] Error al cargar subfamilias:', err);
        this.error = 'Error al cargar las subfamilias';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('[CATEGORIAS] Categorías cargadas:', data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[CATEGORIAS] Error al cargar categorías:', err);
        this.error = 'Error al cargar las categorías de defectos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }


   //Obtener nombre de subfamilia por ID
  getNombreSubfamilia(subfamiliaId: number): string {
    const subfamilia = this.subfamilias.find(s => s.id === subfamiliaId);
    return subfamilia ? subfamilia.nombre : `ID: ${subfamiliaId}`;
  }


   // Filtrado
  get categoriasFiltradas(): CategoriaDefecto[] {
    if (!this.filtro.trim()) return this.categorias;

    const filtroLower = this.filtro.toLowerCase();
    return this.categorias.filter(c => {
      const nombreSubfamilia = this.getNombreSubfamilia(c.subfamiliaId).toLowerCase();
      return (
        c.nombre.toLowerCase().includes(filtroLower) ||
        c.codigo.toLowerCase().includes(filtroLower) ||
        c.descripcion.toLowerCase().includes(filtroLower) ||
        nombreSubfamilia.includes(filtroLower) ||
        (c.id?.toString() || '').includes(filtroLower)
      );
    });
  }


   // Paginación

  get categoriasPaginadas(): CategoriaDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.categoriasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }


   //Abrir modal crear
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.categoriaEditando = this.getCategoriaVacia();
    this.mostrarModalForm = true;
  }


   // Abrir modal editar
  abrirModalEditar(categoria: CategoriaDefecto): void {
    this.modoEdicion = true;
    this.categoriaEditando = { ...categoria };
    this.mostrarModalForm = true;
  }


   //Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.categoriaEditando = this.getCategoriaVacia();
  }


   // Validar solo números en código (permite formato XX)

  validarCodigoNumerico(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    // Permitir: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(charCode) !== -1) {
      return;
    }
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


   // Validar que nombre no contenga solo números

  validarNombreTexto(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value + event.key;

    // Si el valor resultante es solo números (ej: "123", "-1"), prevenir
    if (/^-?\d+$/.test(valor)) {
      event.preventDefault();
    }
  }


   // Validar formulario completo
  validarFormulario(): boolean {
    // Validar subfamilia
    if (!this.categoriaEditando.subfamiliaId || this.categoriaEditando.subfamiliaId === 0) {
      alert('Debe seleccionar una subfamilia');
      return false;
    }

    // Validar código
    if (!this.categoriaEditando.codigo.trim()) {
      alert('El código es obligatorio');
      return false;
    }

    // Validar que código sea numérico (ej: "01", "02")
    if (!/^\d{1,2}$/.test(this.categoriaEditando.codigo)) {
      alert('El código debe ser numérico (ej: 01, 02, 10)');
      return false;
    }

    // Validar nombre
    if (!this.categoriaEditando.nombre.trim()) {
      alert('El nombre es obligatorio');
      return false;
    }

    // Validar que nombre no sea solo números
    if (/^-?\d+$/.test(this.categoriaEditando.nombre.trim())) {
      alert('El nombre no puede ser solo números (ej: -1, 123)');
      return false;
    }

    return true;
  }


   // Guardar categoría

  guardarCategoria(): void {
    if (!this.validarFormulario()) return;

    console.log('[CATEGORIA] Guardando:', this.categoriaEditando);
    this.guardando = true;

    if (this.modoEdicion && this.categoriaEditando.id) {
      // Actualizar
      this.categoriaService.actualizar(
        this.categoriaEditando.id,
        this.categoriaEditando
      ).subscribe({
        next: () => {
          console.log('[CATEGORIA] Actualizada OK');
          this.cargarCategorias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[CATEGORIA] Error al actualizar:', err);
          alert('Error al actualizar la categoría');
          this.guardando = false;
        }
      });
    } else {
      // Crear
      this.categoriaService.crear(this.categoriaEditando).subscribe({
        next: () => {
          console.log('[CATEGORIA] Creada OK');
          this.cargarCategorias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[CATEGORIA] Error al crear:', err);
          alert('Error al crear la categoría');
          this.guardando = false;
        }
      });
    }
  }


   // Ver detalle
  verDetalle(categoria: CategoriaDefecto): void {
    this.categoriaDetalle = categoria;
    this.mostrarModalDetalle = true;
  }


   //Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.categoriaDetalle = null;
  }
}
