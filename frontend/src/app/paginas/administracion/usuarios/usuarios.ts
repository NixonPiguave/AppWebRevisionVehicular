import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuariosService, Usuario, Rol, Area, Empresa } from '../../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  // Datos principales
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  // Datos para selects
  roles: Rol[] = [];
  areas: Area[] = [];
  empresas: Empresa[] = [];

  // Búsqueda y paginación
  terminoBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;
  totalPaginas: number = 1;

  // Modales
  mostrarModalForm: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalConfirmacion: boolean = false;

  // Edición
  modoEdicion: boolean = false;
  usuarioEditando: Usuario = this.crearUsuarioVacio();
  usuarioDetalle: Usuario | null = null;
  usuarioAEliminar: Usuario | null = null;

  // Validación
  erroresValidacion: { [key: string]: string } = {};

  // Estado
  cargando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Crear usuario vacío
  crearUsuarioVacio(): Usuario {
    return {
      usuarioId: undefined,
      nombre: '',
      apellido: '',
      usuario: '',
      contrasena: '',
      usuarioBaseDatos: '',
      contrasenaBaseDatos: '',
      documentoIdentidad: '',
      email: '',
      estado: 'Activo',
      rolesIds: [],
      roles: [],
      areaId: 0,
      empresaId: 0
    };
  }

  // Cargar todos los datos necesarios
  cargarDatos(): void {
    this.cargando = true;

    // Cargar roles, áreas y empresas primero
    this.usuariosService.listarRoles().subscribe({
      next: (data) => {
        console.log('[USUARIOS] Roles recibidos del backend:', data);
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[USUARIOS] Error cargando roles:', err)
    });

    this.usuariosService.listarAreas().subscribe({
      next: (data) => {
        console.log('[USUARIOS] Áreas recibidas del backend:', data);
        this.areas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[USUARIOS] Error cargando áreas:', err)
    });

    this.usuariosService.listarEmpresas().subscribe({
      next: (data) => {
        console.log('[USUARIOS] Empresas recibidas del backend:', data);
        this.empresas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[USUARIOS] Error cargando empresas:', err)
    });

    // Cargar usuarios
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.map(u => ({
          ...u,
          areaNombre: this.obtenerNombreArea(u.areaId),
          empresaNombre: this.obtenerNombreEmpresa(u.empresaId)
        }));
        this.filtrarUsuarios();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarError('Error al cargar usuarios');
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // Obtener nombres para mostrar en tabla
  obtenerNombreArea(areaId: number): string {
    const area = this.areas.find(a => a.areaId === areaId);
    return area ? area.nombre : 'N/A';
  }

  obtenerNombreEmpresa(empresaId: number): string {
    const empresa = this.empresas.find(e => e.empresaId === empresaId);
    return empresa ? empresa.nombre : 'N/A';
  }

  obtenerNombresRoles(roles: Rol[] | undefined): string {
    if (!roles || roles.length === 0) return 'Sin roles';
    return roles.map(r => r.nombre).join(', ');
  }

  // Filtrar usuarios
  filtrarUsuarios(): void {
    if (!this.terminoBusqueda.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const termino = this.terminoBusqueda.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u =>
        u.nombre.toLowerCase().includes(termino) ||
        u.apellido.toLowerCase().includes(termino) ||
        u.usuario.toLowerCase().includes(termino) ||
        u.email.toLowerCase().includes(termino) ||
        u.documentoIdentidad.toLowerCase().includes(termino)
      );
    }
    this.calcularPaginacion();
  }

  // Paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.elementosPorPagina);
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas || 1;
    }
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginasArray(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);

    if (fin - inicio + 1 < maxPaginasVisibles) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Modal crear
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.usuarioEditando = this.crearUsuarioVacio();
    this.erroresValidacion = {};
    this.mostrarModalForm = true;
  }

  // Modal editar
  abrirModalEditar(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditando = {
      ...usuario,
      rolesIds: usuario.rolesIds ? [...usuario.rolesIds] : [],
      // ✅ IMPORTANTE: Dejar vacío para NO actualizar la contraseña
      contrasena: ''
    };
    this.erroresValidacion = {};
    this.mostrarModalForm = true;
  }

  // Modal detalle
  abrirModalDetalle(usuario: Usuario): void {
    this.usuarioDetalle = {
      ...usuario,
      areaNombre: this.obtenerNombreArea(usuario.areaId),
      empresaNombre: this.obtenerNombreEmpresa(usuario.empresaId)
    };
    this.mostrarModalDetalle = true;
  }

  // Modal eliminar
  abrirModalEliminar(usuario: Usuario): void {
    this.usuarioAEliminar = usuario;
    this.mostrarModalConfirmacion = true;
  }

  // Cerrar modales
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.usuarioEditando = this.crearUsuarioVacio();
    this.erroresValidacion = {};
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.usuarioDetalle = null;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.usuarioAEliminar = null;
  }

  // Validación
  validarFormulario(): boolean {
    this.erroresValidacion = {};

    if (!this.usuarioEditando.nombre.trim()) {
      this.erroresValidacion['nombre'] = 'El nombre es requerido';
    }

    if (!this.usuarioEditando.apellido.trim()) {
      this.erroresValidacion['apellido'] = 'El apellido es requerido';
    }

    if (!this.usuarioEditando.usuario.trim()) {
      this.erroresValidacion['usuario'] = 'El usuario es requerido';
    }

    // ✅ Solo requerir contraseña al CREAR
    if (!this.modoEdicion && !this.usuarioEditando.contrasena.trim()) {
      this.erroresValidacion['contrasena'] = 'La contraseña es requerida';
    }

    if (!this.usuarioEditando.documentoIdentidad.trim()) {
      this.erroresValidacion['documentoIdentidad'] = 'El documento de identidad es requerido';
    }

    if (!this.usuarioEditando.email.trim()) {
      this.erroresValidacion['email'] = 'El email es requerido';
    } else if (!this.validarEmail(this.usuarioEditando.email)) {
      this.erroresValidacion['email'] = 'El email no es válido';
    }

    if (!this.usuarioEditando.areaId || this.usuarioEditando.areaId === 0) {
      this.erroresValidacion['areaId'] = 'Debe seleccionar un área';
    }

    if (!this.usuarioEditando.empresaId || this.usuarioEditando.empresaId === 0) {
      this.erroresValidacion['empresaId'] = 'Debe seleccionar una empresa';
    }

    if (!this.usuarioEditando.rolesIds || this.usuarioEditando.rolesIds.length === 0) {
      this.erroresValidacion['rolesIds'] = 'Debe seleccionar al menos un rol';
    }

    return Object.keys(this.erroresValidacion).length === 0;
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Manejo de roles (checkbox)
  toggleRol(rolId: number): void {
    const index = this.usuarioEditando.rolesIds.indexOf(rolId);
    if (index === -1) {
      this.usuarioEditando.rolesIds.push(rolId);
    } else {
      this.usuarioEditando.rolesIds.splice(index, 1);
    }
  }

  tieneRol(rolId: number): boolean {
    return this.usuarioEditando.rolesIds.includes(rolId);
  }

  // ✅ GUARDAR USUARIO - CORREGIDO
  guardarUsuario(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;

    // Preparar objeto base
    const usuarioParaEnviar: any = {
      nombre: this.usuarioEditando.nombre,
      apellido: this.usuarioEditando.apellido,
      usuario: this.usuarioEditando.usuario,
      documentoIdentidad: this.usuarioEditando.documentoIdentidad,
      email: this.usuarioEditando.email,
      estado: this.usuarioEditando.estado,
      areaId: Number(this.usuarioEditando.areaId),
      empresaId: Number(this.usuarioEditando.empresaId),
      rolesIds: this.usuarioEditando.rolesIds.map(id => Number(id))
    };

    // ✅ CAMBIO CRÍTICO: Solo incluir contraseña SI tiene valor
    if (this.usuarioEditando.contrasena && this.usuarioEditando.contrasena.trim() !== '') {
      usuarioParaEnviar.contrasena = this.usuarioEditando.contrasena;
    }
    // Si NO se incluye 'contrasena', el backend NO la actualizará (mantiene la actual)

    // Solo para crear: incluir usuarioBaseDatos y contrasenaBaseDatos
    if (!this.modoEdicion) {
      usuarioParaEnviar.usuarioBaseDatos = this.usuarioEditando.usuarioBaseDatos || '';
      usuarioParaEnviar.contrasenaBaseDatos = this.usuarioEditando.contrasenaBaseDatos || '';
    }

    // Solo para editar: incluir el ID
    if (this.modoEdicion) {
      usuarioParaEnviar.usuarioId = this.usuarioEditando.usuarioId;
    }

    console.log('[USUARIOS] Enviando al backend:', JSON.stringify(usuarioParaEnviar, null, 2));

    if (this.modoEdicion) {
      // EDITAR
      this.usuariosService.actualizarUsuario(usuarioParaEnviar.usuarioId!, usuarioParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Usuario actualizado correctamente');
          this.cerrarModalForm();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.mostrarError('Error al actualizar usuario');
          this.cargando = false;
          console.error('[USUARIOS] Error al actualizar:', err);
        }
      });
    } else {
      // CREAR
      this.usuariosService.crearUsuario(usuarioParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Usuario creado correctamente');
          this.cerrarModalForm();
          this.cargarUsuarios();
        },
        error: (err) => {
          this.mostrarError('Error al crear usuario');
          this.cargando = false;
          console.error('[USUARIOS] Error al crear:', err);
        }
      });
    }
  }

  // Eliminar usuario
  confirmarEliminar(): void {
    if (!this.usuarioAEliminar) return;

    this.cargando = true;
    this.usuariosService.eliminarUsuario(this.usuarioAEliminar.usuarioId!).subscribe({
      next: () => {
        this.mostrarExito('Usuario eliminado correctamente');
        this.cerrarModalConfirmacion();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.mostrarError('Error al eliminar usuario');
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // Mensajes
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  // Utilidades
  getEstadoClass(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }
}
