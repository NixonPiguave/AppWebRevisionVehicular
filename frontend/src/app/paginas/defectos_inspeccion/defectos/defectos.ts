import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  DefectosService,
  Defectos,
  CategoriaDefecto,
  SubfamiliaDefecto,
  Familia,
  TipoDefecto
} from '../../../services/defectos_inspeccion/defectos.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-defectos',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './defectos.html',
  styleUrl: './defectos.css',
})
export class DefectosComponent implements OnInit {
  defectos: Defectos[] = [];
  subfamilias: SubfamiliaDefecto[] = [];
  categorias: CategoriaDefecto[] = [];
  familias: Familia[] = [];
  tiposDefecto: TipoDefecto[] = [];

  cargando: boolean = false;
  error: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  defectoEditando: Defectos = this.getDefectoVacio();
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  defectoDetalle: Defectos | null = null;

  // ✅ Variables para autocompletado (subfamilia y familia)
  subfamiliaAutocompletada: string = '';
  familiaAutocompletada: string = '';

  constructor(
    private defectosService: DefectosService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  getDefectoVacio(): Defectos {
    return {
      id: null,
      codigo: '',
      descripcion: '',
      puntoDeTrabajo: '',
      maquinaria: '',
      procedimientos: '',
      descripciontipo: '',
      observaciones: '',
      estado: 'A',
      tipoDefectoId: 0,
      subfamiliaId: 0,
      categoriaId: 0
    };
  }

  /**
   * ✅ Cargar todas las relaciones
   */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    // Cargar todas las entidades relacionadas
    this.defectosService.listarTipoDefectos().subscribe({
      next: (tipos) => {
        this.tiposDefecto = tipos;
        console.log('[DEFECTOS] Tipos de defecto cargados:', tipos);

        this.defectosService.listarFamilias().subscribe({
          next: (familias) => {
            this.familias = familias;
            console.log('[DEFECTOS] Familias cargadas:', familias);

            this.defectosService.listarSubfamilias().subscribe({
              next: (subfamilias) => {
                this.subfamilias = subfamilias;
                console.log('[DEFECTOS] Subfamilias cargadas:', subfamilias);

                this.defectosService.listarCategorias().subscribe({
                  next: (categorias) => {
                    this.categorias = categorias;
                    console.log('[DEFECTOS] Categorías cargadas:', categorias);

                    // Finalmente cargar defectos
                    this.cargarDefectos();
                  },
                  error: (err) => this.manejarError('categorías', err)
                });
              },
              error: (err) => this.manejarError('subfamilias', err)
            });
          },
          error: (err) => this.manejarError('familias', err)
        });
      },
      error: (err) => this.manejarError('tipos de defecto', err)
    });
  }

  cargarDefectos(): void {
    this.defectosService.listar().subscribe({
      next: (data) => {
        this.defectos = data;
        console.log('[DEFECTOS] Defectos cargados:', data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[DEFECTOS] Error al cargar defectos:', err);
        this.error = 'Error al cargar los defectos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  manejarError(entidad: string, err: any): void {
    console.error(`[DEFECTOS] Error al cargar ${entidad}:`, err);
    this.error = `Error al cargar ${entidad}`;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  /**
   * ✅ Obtener nombres para mostrar en tabla
   */
  getNombreTipoDefecto(id: number): string {
    const tipo = this.tiposDefecto.find(t => t.id === id);
    return tipo ? tipo.nombre : `ID: ${id}`;
  }

  getNombreSubfamilia(id: number): string {
    const subfamilia = this.subfamilias.find(s => s.id === id);
    return subfamilia ? subfamilia.nombre : `ID: ${id}`;
  }

  getNombreFamilia(id: number): string {
    const familia = this.familias.find(f => f.id === id);
    return familia ? familia.nombre : `ID: ${id}`;
  }

  getNombreCategoria(id: number): string {
    const categoria = this.categorias.find(c => c.id === id);
    return categoria ? categoria.nombre : `ID: ${id}`;
  }

  /**
   * ✅ Obtener familia desde subfamiliaId
   */
  getFamiliaDeSubfamilia(subfamiliaId: number): string {
    const subfamilia = this.subfamilias.find(s => s.id === subfamiliaId);
    if (subfamilia) {
      return this.getNombreFamilia(subfamilia.familiaId);
    }
    return 'No especificada';
  }

  /**
   * ✅ Llenar subfamiliaId y familiaId internamente al seleccionar categoría
   *    (no se muestran en el modal, solo se usan para guardar)
   */
  onCategoriaChange(): void {
    const categoriaId = Number(this.defectoEditando.categoriaId || 0);

    if (categoriaId > 0) {
      // 1. Buscar categoría seleccionada (asegurando comparación numérica)
      const categoria = this.categorias.find(c => Number(c.id) === categoriaId);

      if (categoria) {
        // 2. Tomar el subfamiliaId directamente de la categoría
        const subfamiliaId = Number(categoria.subfamiliaId || 0);
        this.defectoEditando.subfamiliaId = subfamiliaId;

        // 3. Buscar subfamilia para mostrar nombres (solo informativo)
        const subfamilia = this.subfamilias.find(s => Number(s.id) === subfamiliaId);

        if (subfamilia) {
          this.subfamiliaAutocompletada = subfamilia.nombre;

          const familia = this.familias.find(f => Number(f.id) === Number(subfamilia.familiaId));
          this.familiaAutocompletada = familia ? familia.nombre : '';
        } else {
          this.subfamiliaAutocompletada = '';
          this.familiaAutocompletada = '';
        }

        console.log('[DEFECTOS] Autocompletado interno:');
        console.log('  Categoría ID:', categoriaId);
        console.log('  Subfamilia ID:', this.defectoEditando.subfamiliaId);
        console.log('  Subfamilia nombre:', this.subfamiliaAutocompletada);
        console.log('  Familia nombre:', this.familiaAutocompletada);
      } else {
        // Si por algún motivo no encontramos la categoría, limpiamos
        this.defectoEditando.subfamiliaId = 0;
        this.subfamiliaAutocompletada = '';
        this.familiaAutocompletada = '';
      }
    } else {
      // Limpiar si se deselecciona
      this.defectoEditando.subfamiliaId = 0;
      this.subfamiliaAutocompletada = '';
      this.familiaAutocompletada = '';
    }

    this.cdr.detectChanges();
  }

  /**
   * ✅ Filtrado
   */
  get defectosFiltrados(): Defectos[] {
    if (!this.filtro.trim()) return this.defectos;

    const filtroLower = this.filtro.toLowerCase();
    return this.defectos.filter(d =>
      d.codigo.toLowerCase().includes(filtroLower) ||
      d.descripcion.toLowerCase().includes(filtroLower) ||
      d.puntoDeTrabajo.toLowerCase().includes(filtroLower) ||
      d.maquinaria.toLowerCase().includes(filtroLower) ||
      d.procedimientos.toLowerCase().includes(filtroLower) ||
      (d.id?.toString() || '').includes(filtroLower)
    );
  }

  /**
   * ✅ Paginación
   */
  get defectosPaginados(): Defectos[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.defectosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.defectosFiltrados.length / this.registrosPorPagina);
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

  /**
   * ✅ Abrir modal crear
   */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.defectoEditando = this.getDefectoVacio();
    this.subfamiliaAutocompletada = '';
    this.familiaAutocompletada = '';
    this.mostrarModalForm = true;
  }

  /**
   * ✅ Abrir modal editar
   */
  abrirModalEditar(defecto: Defectos): void {
    this.modoEdicion = true;
    this.defectoEditando = { ...defecto };

    // Autocompletar subfamilia y familia si tiene categoría
    if (this.defectoEditando.categoriaId) {
      const categoria = this.categorias.find(c => c.id === this.defectoEditando.categoriaId);

      if (categoria) {
        const subfamilia = this.subfamilias.find(s => s.id === categoria.subfamiliaId);

        if (subfamilia) {
          this.subfamiliaAutocompletada = subfamilia.nombre;

          const familia = this.familias.find(f => f.id === subfamilia.familiaId);
          if (familia) {
            this.familiaAutocompletada = familia.nombre;
          }
        }
      }
    }

    this.mostrarModalForm = true;
  }

  /**
   * ✅ Cerrar modal form
   */
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.defectoEditando = this.getDefectoVacio();
    this.subfamiliaAutocompletada = '';
    this.familiaAutocompletada = '';
  }

  /**
   * ✅ Validar código: solo números 1-9
   */
  validarCodigoNumerico(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Permitir: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(charCode) !== -1) {
      return;
    }

    // Permitir solo números 1-9 (49-57 en ASCII)
    if (charCode < 49 || charCode > 57) {
      event.preventDefault();
    }
  }

  /**
   * ✅ Validar formulario
   */
  validarFormulario(): boolean {
    // Código obligatorio
    if (!this.defectoEditando.codigo.trim()) {
      this.notification.error('El código es obligatorio');
      return false;
    }

    // Código debe ser 1-9
    const codigoNum = parseInt(this.defectoEditando.codigo);
    if (isNaN(codigoNum) || codigoNum < 1 || codigoNum > 9) {
      this.notification.error('El código debe ser un número entre 1 y 9');
      return false;
    }

    // Descripción obligatoria
    if (!this.defectoEditando.descripcion.trim()) {
      this.notification.error('La descripción es obligatoria');
      return false;
    }

    // Tipo defecto obligatorio
    if (!this.defectoEditando.tipoDefectoId || this.defectoEditando.tipoDefectoId === 0) {
      this.notification.error('Debe seleccionar un tipo de defecto');
      return false;
    }

    // Categoría obligatoria (subfamilia y familia se autocompletan desde aquí)
    if (!this.defectoEditando.categoriaId || this.defectoEditando.categoriaId === 0) {
      this.notification.error('Debe seleccionar una categoría');
      return false;
    }

    return true;
  }

  /**
   * ✅ Guardar defecto
   */
  guardarDefecto(): void {
    if (!this.validarFormulario()) return;

    console.log('[DEFECTOS] Guardando:', this.defectoEditando);
    this.guardando = true;

    if (this.modoEdicion && this.defectoEditando.id) {
      // Actualizar
      this.defectosService.actualizar(this.defectoEditando.id, this.defectoEditando).subscribe({
        next: () => {
          this.notification.success('Defecto actualizado correctamente.');
          this.cargarDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[DEFECTOS] Error al actualizar:', err);
          this.notification.error('Error al actualizar el defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear
      this.defectosService.crear(this.defectoEditando).subscribe({
        next: () => {
          this.notification.success('Defecto creado correctamente.');
          this.cargarDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[DEFECTOS] Error al crear:', err);
          this.notification.error('Error al crear el defecto');
          this.guardando = false;
        }
      });
    }
  }

  /**
   *  Ver detalle (muestra TODO)
   */
  verDetalle(defecto: Defectos): void {
    this.defectoDetalle = defecto;
    this.mostrarModalDetalle = true;
  }

  /**
   *  Cerrar modal detalle
   */
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.defectoDetalle = null;
  }
}
