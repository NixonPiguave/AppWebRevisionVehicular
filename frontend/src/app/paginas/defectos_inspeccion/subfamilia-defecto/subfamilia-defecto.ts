import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubfamiliaDefectoService, SubfamiliaDefecto } from "../../../services/defectos_inspeccion//subfamilia_defecto.service";
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-subfamilia-defecto',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './subfamilia-defecto.html',
  styleUrls: ['./subfamilia-defecto.css'],
})
export class SubfamiliaDefectoComponent implements OnInit {
  // Lista de subfamilias de defectos (se carga desde el backend)
  subfamiliasDefectos: SubfamiliaDefecto[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  subfamiliaDefectoEditando: SubfamiliaDefecto = {
    subfamiliaId: null,
    familiaId: 0,
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  subfamiliaDefectoDetalle: SubfamiliaDefecto | null = null;

  constructor(
    private subfamiliaDefectoService: SubfamiliaDefectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSubfamiliasDefectos();
  }

  /**
   * Cargar subfamilias de defectos desde el backend
   */
  cargarSubfamiliasDefectos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.subfamiliaDefectoService.listarSubfamiliasDefectos().subscribe({
      next: (data) => {
        console.log('Subfamilias de defectos cargadas:', data);
        this.subfamiliasDefectos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar subfamilias de defectos:', err);
        this.error = 'Error al cargar las subfamilias de defectos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para subfamilias de defectos filtradas
  get subfamiliasDefectosFiltradas(): SubfamiliaDefecto[] {
    if (!this.filtro.trim()) {
      return this.subfamiliasDefectos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.subfamiliasDefectos.filter(
      (subfamilia) =>
        subfamilia.nombre.toLowerCase().includes(filtroLower) ||
        subfamilia.descripcion.toLowerCase().includes(filtroLower) ||
        (subfamilia.subfamiliaId?.toString() || '').includes(filtroLower) ||
        (subfamilia.familiaId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(subfamilia.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para subfamilias de defectos paginadas
  get subfamiliasDefectosPaginadas(): SubfamiliaDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.subfamiliasDefectosFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.subfamiliasDefectosFiltradas.length / this.registrosPorPagina);
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
    this.subfamiliaDefectoEditando = {
      subfamiliaId: null,
      familiaId: 0,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(subfamiliaDefecto: SubfamiliaDefecto): void {
    this.modoEdicion = true;
    this.subfamiliaDefectoEditando = { ...subfamiliaDefecto };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.subfamiliaDefectoEditando = {
      subfamiliaId: null,
      familiaId: 0,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }

  // Guardar subfamilia de defecto (crear o editar)
  guardarSubfamiliaDefecto(): void {
    // Validaciones
    if (this.subfamiliaDefectoEditando.familiaId <= 0) {
      alert('El ID de familia es requerido y debe ser mayor a 0');
      return;
    }
    if (!this.subfamiliaDefectoEditando.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!this.subfamiliaDefectoEditando.descripcion.trim()) {
      alert('La descripción es requerida');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.subfamiliaDefectoEditando.subfamiliaId) {
      // Editar existente
      this.subfamiliaDefectoService.actualizarSubfamiliaDefecto(
        this.subfamiliaDefectoEditando.subfamiliaId,
        this.subfamiliaDefectoEditando
      ).subscribe({
        next: () => {
          this.cargarSubfamiliasDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar subfamilia de defecto:', err);
          alert('Error al actualizar la subfamilia de defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.subfamiliaDefectoService.crearSubfamiliaDefecto(this.subfamiliaDefectoEditando).subscribe({
        next: () => {
          this.cargarSubfamiliasDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear subfamilia de defecto:', err);
          alert('Error al crear la subfamilia de defecto');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(subfamiliaDefecto: SubfamiliaDefecto): void {
    this.subfamiliaDefectoDetalle = subfamiliaDefecto;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.subfamiliaDefectoDetalle = null;
  }
}
