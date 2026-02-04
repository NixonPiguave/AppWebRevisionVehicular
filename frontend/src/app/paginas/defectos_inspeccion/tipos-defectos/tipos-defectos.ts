import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TiposDefectosService, TipoDefecto } from '../../../services/defectos_inspeccion/tipos_defectos.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tipos-defectos',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './tipos-defectos.html',
  styleUrl: './tipos-defectos.css',
})
export class TiposDefectosComponent implements OnInit {
  // Lista de tipos de defectos (se carga desde el backend)
  tiposDefectos: TipoDefecto[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  tipoDefectoEditando: TipoDefecto = {
    tipoDefectoId: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  tipoDefectoDetalle: TipoDefecto | null = null;

  constructor(
    private tiposDefectosService: TiposDefectosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTiposDefectos();
  }

  /**
   * Cargar tipos de defectos desde el backend
   */
  cargarTiposDefectos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tiposDefectosService.listarTiposDefectos().subscribe({
      next: (data) => {
        console.log('Tipos de defectos cargados:', data);
        this.tiposDefectos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de defectos:', err);
        this.error = 'Error al cargar los tipos de defectos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para tipos de defectos filtrados
  get tiposDefectosFiltrados(): TipoDefecto[] {
    if (!this.filtro.trim()) {
      return this.tiposDefectos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.tiposDefectos.filter(
      (tipo) =>
        tipo.codigo.toLowerCase().includes(filtroLower) ||
        tipo.nombre.toLowerCase().includes(filtroLower) ||
        tipo.descripcion.toLowerCase().includes(filtroLower) ||
        (tipo.tipoDefectoId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(tipo.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para tipos de defectos paginados
  get tiposDefectosPaginados(): TipoDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.tiposDefectosFiltrados.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.tiposDefectosFiltrados.length / this.registrosPorPagina);
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
    this.tipoDefectoEditando = {
      tipoDefectoId: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(tipoDefecto: TipoDefecto): void {
    this.modoEdicion = true;
    this.tipoDefectoEditando = { ...tipoDefecto };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.tipoDefectoEditando = {
      tipoDefectoId: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }

  // Guardar tipo de defecto (crear o editar)
  guardarTipoDefecto(): void {
    // Validaciones
    if (!this.tipoDefectoEditando.codigo.trim()) {
      alert('El código es requerido');
      return;
    }
    if (!this.tipoDefectoEditando.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!this.tipoDefectoEditando.descripcion.trim()) {
      alert('La descripción es requerida');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.tipoDefectoEditando.tipoDefectoId) {
      // Editar existente
      this.tiposDefectosService.actualizarTipoDefecto(
        this.tipoDefectoEditando.tipoDefectoId,
        this.tipoDefectoEditando
      ).subscribe({
        next: () => {
          this.cargarTiposDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar tipo de defecto:', err);
          alert('Error al actualizar el tipo de defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.tiposDefectosService.crearTipoDefecto(this.tipoDefectoEditando).subscribe({
        next: () => {
          this.cargarTiposDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear tipo de defecto:', err);
          alert('Error al crear el tipo de defecto');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(tipoDefecto: TipoDefecto): void {
    this.tipoDefectoDetalle = tipoDefecto;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.tipoDefectoDetalle = null;
  }
}
