import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RolesService, Rol } from '../../../services/administracion/roles.service';

interface Permiso {
  id: number;
  modulo: string;
  descripcion: string;
  seleccionado?: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class RolesComponent implements OnInit {

  readonly PERMISOS_DISPONIBLES: Permiso[] = [
    {
      id: 1,
      modulo: 'LECTURA',
      descripcion: 'Permiso de solo lectura en todas las tablas del sistema',
      seleccionado: false
    },
    {
      id: 2,
      modulo: 'INSPECTOR',
      descripcion: 'Permiso para realizar inspecciones vehiculares',
      seleccionado: false
    },
    {
      id: 3,
      modulo: 'CONTADOR',
      descripcion: 'Permiso para gestionar pagos de inspecciones',
      seleccionado: false
    },
    {
      id: 4,
      modulo: 'OPERADOR',
      descripcion: 'Permiso para gestión operativa de turnos y clientes',
      seleccionado: false
    },
    {
      id: 5,
      modulo: 'ADMINISTRADOR',
      descripcion: 'Permiso para todo el sistema',
      seleccionado: false
    }
  ];

  roles: Rol[] = [];
  cargando: boolean = false;
  error: string = '';
  mensajeExito: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  rolEditando: Rol = { rolId: null, nombre: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  rolDetalle: Rol | null = null;

  permisosFormulario: Permiso[] = [];

  constructor(
    private rolesService: RolesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.rolesService.listarRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los roles. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get rolesFiltrados(): Rol[] {
    if (!this.filtro.trim()) {
      return this.roles;
    }

    const filtroLower = this.filtro.toLowerCase();

    return this.roles.filter(
      (rol) =>
        rol.nombre.toLowerCase().includes(filtroLower) ||
        (rol.rolId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(rol.estado).toLowerCase().includes(filtroLower)
    );
  }

  get rolesPaginados(): Rol[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.rolesFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.rolesFiltrados.length / this.registrosPorPagina);
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

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.rolEditando = { rolId: null, nombre: '', estado: 'A' };

    this.permisosFormulario = this.PERMISOS_DISPONIBLES.map(p => ({
      ...p,
      seleccionado: false
    }));

    this.error = '';
    this.mensajeExito = '';
    this.mostrarModalForm = true;
  }

  abrirModalEditar(rol: Rol): void {
    this.modoEdicion = true;
    this.rolEditando = { ...rol };

    this.permisosFormulario = this.PERMISOS_DISPONIBLES.map(p => ({
      ...p,
      seleccionado: false
    }));

    this.error = '';
    this.mensajeExito = '';
    this.mostrarModalForm = true;
  }

  togglePermiso(permiso: Permiso): void {
    permiso.seleccionado = !permiso.seleccionado;
  }

  getPermisosSeleccionados(): number[] {
    return this.permisosFormulario
      .filter(p => p.seleccionado)
      .map(p => p.id);
  }

  validarPermisos(): boolean {
    return this.getPermisosSeleccionados().length > 0;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.rolEditando = { rolId: null, nombre: '', estado: 'A' };
    this.permisosFormulario = [];
    this.error = '';
  }

  guardarRol(): void {

    this.error = '';
    this.mensajeExito = '';

    if (!this.rolEditando.nombre.trim()) {
      this.error = 'El nombre del rol es requerido';
      return;
    }

    if (!this.validarPermisos()) {
      this.error = 'Debe seleccionar al menos un permiso';
      return;
    }

    this.guardando = true;

    const permisosIds = this.getPermisosSeleccionados();
    const permisosJson = JSON.stringify(permisosIds);

    const datosRol = {
      ...this.rolEditando,
      descripcion: `Rol con permisos: ${this.permisosFormulario
        .filter(p => p.seleccionado)
        .map(p => p.modulo)
        .join(', ')}`,
      permisosJson: permisosJson
    };

    if (this.modoEdicion && this.rolEditando.rolId) {

      this.rolesService.actualizarRol(this.rolEditando.rolId, datosRol).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalForm();
          this.guardando = false;
          this.mensajeExito = 'Rol actualizado exitosamente';
        },
        error: () => {
          this.error = 'Error al actualizar el rol';
          this.guardando = false;
        }
      });

    } else {

      this.rolesService.crearRol(datosRol).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModalForm();
          this.guardando = false;
          this.mensajeExito = 'Rol creado exitosamente';
        },
        error: () => {
          this.error = 'Error al crear el rol';
          this.guardando = false;
        }
      });

    }
  }

  verDetalle(rol: Rol): void {
    this.rolDetalle = rol;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.rolDetalle = null;
  }
}
