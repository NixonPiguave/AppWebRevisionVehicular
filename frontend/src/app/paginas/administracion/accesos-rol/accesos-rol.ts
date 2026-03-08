import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RolesService, Rol, OpcionMenu } from '../../../services/administracion/roles.service';

@Component({
  selector: 'app-accesos-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './accesos-rol.html',
  styleUrl: './accesos-rol.css'
})
export class AccesosRolComponent implements OnInit {

  roles: Rol[] = [];
  opcionesMenu: OpcionMenu[] = [];
  rolSeleccionado: Rol | null = null;
  opcionMenuIdsSeleccionados: Set<number> = new Set();
  cargando = false;
  guardando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(
    private rolesService: RolesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarOpcionesMenu();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.rolesService.listarRoles().subscribe({
      next: (data) => {
        this.roles = data ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
        this.cargando = false;
        this.mostrarMensaje('Error al cargar roles.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  cargarOpcionesMenu(): void {
    this.rolesService.listarOpcionesMenu().subscribe({
      next: (data) => {
        this.opcionesMenu = data ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.opcionesMenu = [];
        this.mostrarMensaje('Error al cargar opciones de menú. Ejecute el script seed-opciones-menu.sql en la BD.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarRol(rol: Rol): void {
    if (!rol.rolId) return;
    this.rolSeleccionado = rol;
    this.opcionMenuIdsSeleccionados = new Set();
    this.cargando = true;
    this.rolesService.obtenerRol(rol.rolId).subscribe({
      next: (r) => {
        if (r.opcionMenuIds && r.opcionMenuIds.length) {
          r.opcionMenuIds.forEach(id => this.opcionMenuIdsSeleccionados.add(id));
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mostrarMensaje('Error al cargar el rol.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleOpcion(opcionMenuId: number): void {
    if (this.opcionMenuIdsSeleccionados.has(opcionMenuId)) {
      this.opcionMenuIdsSeleccionados.delete(opcionMenuId);
    } else {
      this.opcionMenuIdsSeleccionados.add(opcionMenuId);
    }
    this.opcionMenuIdsSeleccionados = new Set(this.opcionMenuIdsSeleccionados);
    this.cdr.detectChanges();
  }

  estaSeleccionado(opcionMenuId: number): boolean {
    return this.opcionMenuIdsSeleccionados.has(opcionMenuId);
  }

  seleccionarTodos(): void {
    this.opcionesMenu.forEach(o => this.opcionMenuIdsSeleccionados.add(o.opcionMenuId));
    this.opcionMenuIdsSeleccionados = new Set(this.opcionMenuIdsSeleccionados);
    this.cdr.detectChanges();
  }

  quitarTodos(): void {
    this.opcionMenuIdsSeleccionados.clear();
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.rolSeleccionado || !this.rolSeleccionado.rolId) {
      this.mostrarMensaje('Seleccione un rol.', 'error');
      return;
    }
    this.guardando = true;
    this.tipoMensaje = '';
    this.rolesService.actualizarOpcionesMenu(this.rolSeleccionado.rolId, Array.from(this.opcionMenuIdsSeleccionados)).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarMensaje('Accesos guardados correctamente. Los usuarios con este rol verán solo las opciones marcadas al iniciar sesión.', 'exito');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.mostrarMensaje('Error al guardar.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
  }
}
