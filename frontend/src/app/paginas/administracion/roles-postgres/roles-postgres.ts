import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  PostgresRolAdminService,
  PostgresTabla,
  PostgresRolPrivilegiosActuales,
  CrearRolPostgresPayload,
  SincronizarPrivilegiosPayload,
  TablaPermisosItem
} from '../../../services/administracion/postgres-rol-admin.service';

interface PermisosFilaTabla {
  privilegioSelect: boolean;
  privilegioInsert: boolean;
  privilegioUpdate: boolean;
  privilegioDelete: boolean;
}

@Component({
  selector: 'app-roles-postgres',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './roles-postgres.html',
  styleUrl: './roles-postgres.css'
})
export class RolesPostgresComponent implements OnInit {
  tablas: PostgresTabla[] = [];
  rolesPrefijo: string[] = [];
  filtroTabla = '';
  /** esquema\u0000nombreTabla -> permisos por tabla */
  permisosPorFila: Record<string, PermisosFilaTabla> = {};

  modo: 'crear' | 'editar' = 'crear';
  /** Modo editar: nombre completo desde el desplegable. */
  nombreRol = '';
  /** Modo crear: solo la parte tras rol_ (se sanea en vivo: minúsculas, sin espacios ni caracteres no válidos). */
  sufijoNombreRol = '';
  readonly prefijoRolFijo = 'rol_';

  cargandoLista = false;
  cargandoRoles = false;
  cargandoPrivilegiosRol = false;
  enviando = false;
  error = '';
  exito = '';

  detallePrivilegiosActual: PostgresRolPrivilegiosActuales | null = null;

  constructor(
    private service: PostgresRolAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRolesPrefijo();
    this.cargarTablas();
  }

  onModoCambio(): void {
    this.error = '';
    this.exito = '';
    this.nombreRol = '';
    this.sufijoNombreRol = '';
    this.detallePrivilegiosActual = null;
    this.cargandoPrivilegiosRol = false;
  }

  establecerModo(m: 'crear' | 'editar'): void {
    if (this.modo === m) {
      return;
    }
    this.modo = m;
    this.onModoCambio();
    this.reiniciarPermisosTablas();
  }

  onNombreRolEditarChange(val: string): void {
    this.detallePrivilegiosActual = null;
    const r = (val ?? '').trim();
    if (this.modo !== 'editar' || !r) {
      this.cargandoPrivilegiosRol = false;
      this.reiniciarPermisosTablas();
      return;
    }
    this.cargarPrivilegiosRolExistente(r);
  }

  cargarRolesPrefijo(): void {
    this.cargandoRoles = true;
    this.service.listarRolesPrefijoRol().subscribe({
      next: (data) => {
        this.rolesPrefijo = data ?? [];
        this.cargandoRoles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rolesPrefijo = [];
        this.cargandoRoles = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTablas(): void {
    this.cargandoLista = true;
    this.error = '';
    this.service.listarTablas().subscribe({
      next: (data) => {
        this.tablas = data ?? [];
        this.reiniciarPermisosTablas();
        this.cargandoLista = false;
        if (this.modo === 'editar' && this.nombreRol.trim()) {
          this.cargarPrivilegiosRolExistente(this.nombreRol.trim());
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoLista = false;
        this.error =
          err?.error?.mensaje ??
          err?.message ??
          'No se pudieron listar las tablas. Compruebe permisos del usuario de la BD y que el endpoint esté habilitado.';
        this.cdr.detectChanges();
      }
    });
  }

  private filaVacia(): PermisosFilaTabla {
    return {
      privilegioSelect: false,
      privilegioInsert: false,
      privilegioUpdate: false,
      privilegioDelete: false
    };
  }

  private reiniciarPermisosTablas(): void {
    this.permisosPorFila = {};
    for (const t of this.tablas) {
      this.permisosPorFila[this.clave(t)] = this.filaVacia();
    }
  }

  private cargarPrivilegiosRolExistente(rol: string): void {
    if (!rol || this.tablas.length === 0) {
      return;
    }
    this.cargandoPrivilegiosRol = true;
    this.error = '';
    this.service.obtenerPrivilegiosActuales(rol).subscribe({
      next: (d) => {
        this.detallePrivilegiosActual = d;
        this.reiniciarPermisosTablas();
        for (const row of d.detallePorTabla ?? []) {
          const k = `${row.esquema}\u0000${row.nombreTabla}`;
          if (this.permisosPorFila[k] !== undefined) {
            this.permisosPorFila[k] = {
              privilegioSelect: row.privilegioSelect,
              privilegioInsert: row.privilegioInsert,
              privilegioUpdate: row.privilegioUpdate,
              privilegioDelete: row.privilegioDelete
            };
          }
        }
        this.cargandoPrivilegiosRol = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoPrivilegiosRol = false;
        this.detallePrivilegiosActual = null;
        const httpErr = err as { error?: { message?: string }; message?: string };
        this.error =
          httpErr.error?.message ??
          httpErr.message ??
          'No se pudieron leer los permisos actuales del rol.';
        this.cdr.detectChanges();
      }
    });
  }

  get tablasFiltradas(): PostgresTabla[] {
    const q = this.filtroTabla.trim().toLowerCase();
    if (!q) {
      return this.tablas;
    }
    return this.tablas.filter((t) => {
      const s = `${t.esquema}.${t.nombreTabla}`.toLowerCase();
      return s.includes(q);
    });
  }

  clave(t: PostgresTabla): string {
    return `${t.esquema}\u0000${t.nombreTabla}`;
  }

  /** Alineado con el backend: máximo 59 caracteres tras rol_. */
  private static readonly MAX_SUFIJO_ROL = 59;

  /**
   * Normaliza lo que escribe el usuario: minúsculas, sin espacios, solo a-z 0-9 _. Si pega rol_xxx, quita el prefijo duplicado.
   */
  sanearSufijoNombreRol(value: string): void {
    let v = (value ?? '').toLowerCase().replace(/\s+/g, '');
    if (v.startsWith('rol_')) {
      v = v.slice(4);
    }
    v = v.replace(/[^a-z0-9_]/g, '').slice(0, RolesPostgresComponent.MAX_SUFIJO_ROL);
    this.sufijoNombreRol = v;
  }

  get nombreRolCompletoCrear(): string {
    const s = this.sufijoNombreRol.trim();
    return s ? `${this.prefijoRolFijo}${s}` : '';
  }

  etiqueta(t: PostgresTabla): string {
    return `${t.esquema}.${t.nombreTabla}`;
  }

  fila(t: PostgresTabla): PermisosFilaTabla {
    const k = this.clave(t);
    if (!this.permisosPorFila[k]) {
      this.permisosPorFila[k] = this.filaVacia();
    }
    return this.permisosPorFila[k];
  }

  aplicarAVisiblesSoloSelect(): void {
    for (const t of this.tablasFiltradas) {
      this.permisosPorFila[this.clave(t)] = {
        privilegioSelect: true,
        privilegioInsert: false,
        privilegioUpdate: false,
        privilegioDelete: false
      };
    }
  }

  aplicarAVisiblesCrud(): void {
    for (const t of this.tablasFiltradas) {
      this.permisosPorFila[this.clave(t)] = {
        privilegioSelect: true,
        privilegioInsert: true,
        privilegioUpdate: true,
        privilegioDelete: true
      };
    }
  }

  limpiarVisibles(): void {
    for (const t of this.tablasFiltradas) {
      this.permisosPorFila[this.clave(t)] = this.filaVacia();
    }
  }

  get conteoTablasConPrivilegio(): number {
    return this.tablas.filter((t) => this.tieneAlgunPrivilegio(this.fila(t))).length;
  }

  private tieneAlgunPrivilegio(p: PermisosFilaTabla): boolean {
    return p.privilegioSelect || p.privilegioInsert || p.privilegioUpdate || p.privilegioDelete;
  }

  private construirPermisosPorTablaPayload(): TablaPermisosItem[] {
    const out: TablaPermisosItem[] = [];
    for (const t of this.tablas) {
      const p = this.fila(t);
      if (!this.tieneAlgunPrivilegio(p)) {
        continue;
      }
      out.push({
        esquema: t.esquema,
        nombreTabla: t.nombreTabla,
        privilegioSelect: p.privilegioSelect,
        privilegioInsert: p.privilegioInsert,
        privilegioUpdate: p.privilegioUpdate,
        privilegioDelete: p.privilegioDelete
      });
    }
    return out;
  }

  enviar(): void {
    this.error = '';
    this.exito = '';
    let nombre = '';

    if (this.modo === 'editar') {
      nombre = this.nombreRol.trim();
      if (!nombre) {
        this.error = 'Elija un rol de la lista (prefijo rol_).';
        return;
      }
    } else {
      this.sanearSufijoNombreRol(this.sufijoNombreRol);
      nombre = this.nombreRolCompletoCrear;
      if (!nombre) {
        this.error = 'Indique un nombre para el rol (sin escribir el prefijo rol_).';
        return;
      }
      if (!/^rol_[a-z0-9_]{1,59}$/.test(nombre)) {
        this.error =
          'Use solo letras minúsculas, números y guion bajo en el nombre (1–59 caracteres tras rol_).';
        return;
      }
    }

    const items = this.construirPermisosPorTablaPayload();

    if (this.modo === 'crear' && items.length === 0) {
      this.error = 'Marque al menos un privilegio en alguna tabla.';
      return;
    }

    if (this.modo === 'crear') {
      this.crearRolBackend(nombre, items);
    } else {
      this.actualizarPrivilegiosBackend(nombre, items);
    }
  }

  private crearRolBackend(nombre: string, permisosPorTabla: TablaPermisosItem[]): void {
    const payload: CrearRolPostgresPayload = {
      nombreRol: nombre,
      permisosPorTabla
    };
    this.enviando = true;
    this.service.crearRol(payload).subscribe({
      next: (res) => {
        this.enviando = false;
        this.exito = res?.mensaje ?? 'Rol creado.';
        this.sufijoNombreRol = '';
        this.reiniciarPermisosTablas();
        this.cargarRolesPrefijo();
        this.cdr.detectChanges();
      },
      error: (err) => this.manejarError(err, 'crear')
    });
  }

  private actualizarPrivilegiosBackend(nombre: string, permisosPorTabla: TablaPermisosItem[]): void {
    const payload: SincronizarPrivilegiosPayload = {
      nombreRol: nombre,
      permisosPorTabla
    };
    this.enviando = true;
    this.service.sincronizarPrivilegios(payload).subscribe({
      next: (res) => {
        this.enviando = false;
        this.exito = res?.mensaje ?? 'Privilegios actualizados.';
        if (nombre.trim()) {
          this.cargarPrivilegiosRolExistente(nombre.trim());
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.manejarError(err, 'actualizar')
    });
  }

  private manejarError(err: unknown, contexto: 'crear' | 'actualizar'): void {
    this.enviando = false;
    const httpErr = err as { status?: number; error?: Record<string, string> | string; message?: string };
    if (httpErr.status === 400 && httpErr.error && typeof httpErr.error === 'object') {
      const parts = Object.values(httpErr.error).filter((v) => typeof v === 'string');
      this.error = parts.length ? parts.join(' ') : 'Solicitud no válida.';
    } else {
      const msg =
        (typeof httpErr.error === 'object' && httpErr.error && 'message' in httpErr.error
          ? (httpErr.error as { message?: string }).message
          : null) ??
        (httpErr.error as string | undefined) ??
        httpErr.message;
      this.error =
        msg ??
        (contexto === 'crear'
          ? 'Error al crear el rol (¿CREATEROLE y GRANT?).'
          : 'Error al actualizar privilegios (¿REVOKE/GRANT?).');
    }
    this.cdr.detectChanges();
  }
}
