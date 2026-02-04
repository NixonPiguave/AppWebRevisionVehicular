import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FamiliaDefectoService, FamiliaDefecto } from "../../../services/defectos_inspeccion/familia-defecto.service";
import { MatIconModule } from '@angular/material/icon';
@Component({
  standalone: true,
  selector: 'app-familia-defecto',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './familia-defecto.html',
  styleUrls: ['./familia-defecto.css'],
})
export class FamiliaDefectoComponent implements OnInit {

  // Lista de familias de defectos (se carga desde el backend)
  familiasDefectos: FamiliaDefecto[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  familiaDefectoEditando: FamiliaDefecto = {
    familiaId: null,
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  familiaDefectoDetalle: FamiliaDefecto | null = null;

  constructor(
    private familiaDefectoService: FamiliaDefectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFamiliasDefectos();
  }

  /**
   * Cargar familias de defectos desde el backend
   */
  cargarFamiliasDefectos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.familiaDefectoService.listarFamiliasDefectos().subscribe({
      next: (data) => {
        console.log('Familias de defectos cargadas:', data);
        this.familiasDefectos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar familias de defectos:', err);
        this.error = 'Error al cargar las familias de defectos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para familias de defectos filtradas
  get familiasDefectosFiltradas(): FamiliaDefecto[] {
    if (!this.filtro.trim()) {
      return this.familiasDefectos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.familiasDefectos.filter(
      (familia) =>
        familia.nombre.toLowerCase().includes(filtroLower) ||
        familia.descripcion.toLowerCase().includes(filtroLower) ||
        (familia.familiaId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(familia.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para familias de defectos paginadas
  get familiasDefectosPaginadas(): FamiliaDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.familiasDefectosFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.familiasDefectosFiltradas.length / this.registrosPorPagina);
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
    this.familiaDefectoEditando = {
      familiaId: null,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(familiaDefecto: FamiliaDefecto): void {
    this.modoEdicion = true;
    this.familiaDefectoEditando = { ...familiaDefecto };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.familiaDefectoEditando = {
      familiaId: null,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }

  // Guardar familia de defecto (crear o editar)
  guardarFamiliaDefecto(): void {
    // Validaciones
    if (!this.familiaDefectoEditando.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!this.familiaDefectoEditando.descripcion.trim()) {
      alert('La descripción es requerida');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.familiaDefectoEditando.familiaId) {
      // Editar existente
      this.familiaDefectoService.actualizarFamiliaDefecto(
        this.familiaDefectoEditando.familiaId,
        this.familiaDefectoEditando
      ).subscribe({
        next: () => {
          this.cargarFamiliasDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar familia de defecto:', err);
          alert('Error al actualizar la familia de defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.familiaDefectoService.crearFamiliaDefecto(this.familiaDefectoEditando).subscribe({
        next: () => {
          this.cargarFamiliasDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear familia de defecto:', err);
          alert('Error al crear la familia de defecto');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(familiaDefecto: FamiliaDefecto): void {
    this.familiaDefectoDetalle = familiaDefecto;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.familiaDefectoDetalle = null;
  }
}
