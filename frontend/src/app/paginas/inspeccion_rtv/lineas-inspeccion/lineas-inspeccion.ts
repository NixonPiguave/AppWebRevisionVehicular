import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon'; // ← IMPORTAR Material Icons
import { LineasService, Linea } from '../../../services/inspeccion_rtv/lineas.service';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, RouterModule, FormsModule,MatIconModule],
  templateUrl: './lineas-inspeccion.html',
  styleUrl: './lineas-inspeccion.css',
})
export class LineasInspeccionComponent implements OnInit {
  // Lista de roles (se carga desde el backend)
  roles: Linea[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  rolEditando: Linea = { id: null, nombre: '',  descripcion:'', estado: 'A' };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  rolDetalle: Linea | null = null;

  constructor(
    private rolesService: LineasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  /**
   * Cargar roles desde el backend
   */
  cargarRoles(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges(); // ← Forzar actualización

    this.rolesService.listarRoles().subscribe({
      next: (data) => {
        console.log('Lineas cargadas:', data);
        this.roles = data;
        this.cargando = false;
        this.cdr.detectChanges(); // ← Forzar actualización
      },
      error: (err) => {
        console.error('Error al cargar Linea:', err);
        this.error = 'Error al cargar las Lineas. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges(); // ← Forzar actualización
      }
    });
  }

  // Getter para roles filtrados
  get rolesFiltrados(): Linea[] {
    if (!this.filtro.trim()) {
      return this.roles;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.roles.filter(
      (rol) =>
        rol.nombre.toLowerCase().includes(filtroLower) ||
        (rol.id?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(rol.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para roles paginados
  get rolesPaginados(): Linea[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.rolesFiltrados.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.rolesFiltrados.length / this.registrosPorPagina);
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
    this.rolEditando = { id: null, nombre: '', descripcion:'',estado: 'A'};
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(rol: Linea): void {
    this.modoEdicion = true;
    this.rolEditando = { ...rol };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.rolEditando = { id: null, nombre: '',  descripcion:'',estado: 'A' };
  }

  // Guardar rol (crear o editar)
  guardarRol(): void {
    if (!this.rolEditando.nombre.trim()) {
      alert('El nombre del Linea es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.rolEditando.id) {
      // Editar existente
      this.rolesService.actualizarRol(this.rolEditando.id, this.rolEditando).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar Linea:', err);
          alert('Error al actualizar la Linea');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.rolesService.crearRol(this.rolEditando).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear Linea:', err);
          alert('Error al crear la Linea');
          this.guardando = false;
        }
      });
    }
  }
  // Abrir modal detalle
  verDetalle(rol: Linea): void {
    this.rolDetalle = rol;
    this.mostrarModalDetalle = true;
  }
  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.rolDetalle = null;
  }
}
