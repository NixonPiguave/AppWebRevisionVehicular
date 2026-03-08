import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosService, Usuario, Rol } from '../../../services/administracion/usuarios.service';
import { AuditoriaService, AuditoriaRegistro } from '../../../services/administracion/auditoria.service';
import { EmpresaService, Empresa } from '../../../services/administracion/empresa.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.css']
})
export class AuditoriaComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  terminoBusqueda = '';
  usuariosFiltrados: Usuario[] = [];
  cargando = false;
  cargandoAuditoria = false;
  mensajeError = '';

  mostrarModalAuditoria = false;
  usuarioSeleccionado: Usuario | null = null;
  registrosAuditoria: AuditoriaRegistro[] = [];
  /** Filtro en la visualización: todos | INSERT | UPDATE | DELETE | operaciones | INICIO_SESION | CIERRE_SESION */
  filtroTipo: 'todos' | 'INSERT' | 'UPDATE' | 'DELETE' | 'operaciones' | 'INICIO_SESION' | 'CIERRE_SESION' = 'todos';

  mostrarModalReporte = false;
  tipoReporte: 'general' | 'usuario' | 'rol' = 'general';
  usuarioReporte: number | null = null;
  rolReporte: number | null = null;
  datosReporte: AuditoriaRegistro[] = [];
  cargandoReporte = false;
  empresa: Empresa | null = null;
  logoUrl = '';

  constructor(
    private usuariosService: UsuariosService,
    private auditoriaService: AuditoriaService,
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarEmpresa();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtrarUsuarios();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'Error al cargar usuarios';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarRoles(): void {
    this.usuariosService.listarRoles().subscribe({
      next: (data) => this.roles = data,
      error: () => {}
    });
  }

  cargarEmpresa(): void {
    this.empresaService.obtenerPrimera().subscribe({
      next: (emp) => {
        this.empresa = emp ?? null;
        if (this.empresa?.logoempresa && this.empresa.logoempresa.startsWith('http')) {
          this.logoUrl = this.empresa.logoempresa;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  filtrarUsuarios(): void {
    if (!this.terminoBusqueda.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const t = this.terminoBusqueda.toLowerCase();
      this.usuariosFiltrados = this.usuarios.filter(u =>
        (u.nombre + ' ' + u.apellido).toLowerCase().includes(t) ||
        u.usuario.toLowerCase().includes(t) ||
        (u.email || '').toLowerCase().includes(t)
      );
    }
    this.cdr.detectChanges();
  }

  abrirModalAuditoria(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.registrosAuditoria = [];
    this.filtroTipo = 'todos';
    this.mostrarModalAuditoria = true;
    this.cargandoAuditoria = true;
    this.auditoriaService.listarPorUsuario(usuario.usuarioId!).subscribe({
      next: (data) => {
        this.registrosAuditoria = data;
        this.cargandoAuditoria = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoAuditoria = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalAuditoria(): void {
    this.mostrarModalAuditoria = false;
    this.usuarioSeleccionado = null;
    this.registrosAuditoria = [];
  }

  abrirModalReporte(): void {
    this.tipoReporte = 'general';
    this.usuarioReporte = null;
    this.rolReporte = null;
    this.datosReporte = [];
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
  }

  generarReporte(): void {
    if (this.tipoReporte === 'usuario' && !this.usuarioReporte) return;
    if (this.tipoReporte === 'rol' && !this.rolReporte) return;

    this.cargandoReporte = true;
    const req =
      this.tipoReporte === 'general' ? this.auditoriaService.listarTodas() :
      this.tipoReporte === 'usuario' ? this.auditoriaService.listarPorUsuario(this.usuarioReporte!) :
      this.auditoriaService.listarPorRol(this.rolReporte!);

    req.subscribe({
      next: (data) => {
        this.datosReporte = data;
        this.cargandoReporte = false;
        this.mostrarModalReporte = false;
        this.imprimirReporte();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoReporte = false;
        this.cdr.detectChanges();
      }
    });
  }

  imprimirReporte(): void {
    let titulo: string;
    if (this.tipoReporte === 'general') {
      titulo = 'Reporte general de auditoría';
    } else if (this.tipoReporte === 'usuario' && this.usuarioReporte && this.datosReporte.length > 0) {
      const nombre = this.datosReporte[0].nombreCompleto || this.datosReporte[0].nombreUsuario || 'Usuario';
      titulo = `Reporte de auditoría - ${nombre}`;
    } else if (this.tipoReporte === 'usuario') {
      const u = this.usuarios.find(x => x.usuarioId === this.usuarioReporte);
      titulo = u ? `Reporte de auditoría - ${u.nombre} ${u.apellido} (${u.usuario})` : 'Reporte de auditoría - Usuario';
    } else if (this.tipoReporte === 'rol' && this.rolReporte) {
      const r = this.roles.find(x => x.rolId === this.rolReporte);
      titulo = r ? `Reporte de auditoría - Rol: ${r.nombre}` : 'Reporte de auditoría - Por rol';
    } else {
      titulo = 'Reporte de auditoría - Por rol';
    }
    const nombreEmpresa = this.empresa?.nombre ?? 'Revisión Técnica Vehicular';
    const direccion = this.empresa?.direccion ?? '';
    const telefono = this.empresa?.telefono ?? '';
    const correo = this.empresa?.correo ?? '';
    const ruc = this.empresa?.ruc ?? '';
    const logoImg = this.logoUrl ? `<img src="${this.logoUrl}" alt="Logo" style="max-height:70px;max-width:180px;">` : '';

    const filas = this.datosReporte.map(r => {
      const fecha = r.fecha ? new Date(r.fecha) : null;
      const fechaStr = fecha ? fecha.toLocaleDateString('es-EC') : '-';
      const horaStr = fecha ? fecha.toLocaleTimeString('es-EC') : '-';
      const tipo = (r.tipoAccion || r.accion?.split(' ')[0] || '-');
      const entidad = r.entidad || '-';
      const detalle = (r.detalle || r.accion || '-').substring(0, 120);
      const usuario = r.nombreCompleto || r.nombreUsuario || '-';
      return `<tr>
        <td>${fechaStr}</td>
        <td>${horaStr}</td>
        <td>${tipo}</td>
        <td>${entidad}</td>
        <td>${detalle}</td>
        <td>${usuario}</td>
      </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte de Auditoría</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 24px; background: #fff; }
    .header { border-bottom: 3px solid #2d5a27; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { margin-bottom: 8px; }
    .empresa-nombre { font-size: 22px; font-weight: 700; color: #1a2e1a; }
    .empresa-datos { font-size: 12px; color: #555; margin-top: 4px; }
    h1 { font-size: 18px; color: #2d5a27; margin: 20px 0 16px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d0d0d0; padding: 8px 10px; text-align: left; font-size: 12px; }
    th { background: #2d5a27; color: white; font-weight: 600; }
    tr:nth-child(even) { background: #f5f9f5; }
    .pie { margin-top: 24px; font-size: 11px; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${logoImg}</div>
    <div class="empresa-nombre">${nombreEmpresa}</div>
    <div class="empresa-datos">${direccion} ${telefono ? ' | Tel: ' + telefono : ''} ${correo ? ' | ' + correo : ''} ${ruc ? ' | RUC: ' + ruc : ''}</div>
  </div>
  <h1>${titulo}</h1>
  <p style="font-size:12px;color:#666;">Generado el ${new Date().toLocaleString('es-EC')}. Total de registros: ${this.datosReporte.length}</p>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Tipo</th>
        <th>Entidad</th>
        <th>Detalle</th>
        <th>Usuario</th>
      </tr>
    </thead>
    <tbody>${filas || '<tr><td colspan="6">Sin registros</td></tr>'}
    </tbody>
  </table>
  <div class="pie">Documento generado por el sistema de Revisión Técnica Vehicular. Uso interno.</div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-EC');
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-EC');
  }

  claseTipo(tipo: string): string {
    if (!tipo) return '';
    const t = (tipo || '').toUpperCase();
    if (t.includes('INSERT') || t.includes('CREAR')) return 'tipo-insert';
    if (t.includes('UPDATE') || t.includes('ACTUALIZAR')) return 'tipo-update';
    if (t.includes('DELETE') || t.includes('ELIMINAR')) return 'tipo-delete';
    if (t.includes('INICIO') || t.includes('CIERRE')) return 'tipo-sesion';
    return '';
  }

  /** Registros de auditoría filtrados según filtroTipo (solo para visualización en modal). */
  get registrosAuditoriaFiltrados(): AuditoriaRegistro[] {
    if (!this.registrosAuditoria.length) return [];
    if (this.filtroTipo === 'todos') return this.registrosAuditoria;
    if (this.filtroTipo === 'operaciones') {
      return this.registrosAuditoria.filter(r => {
        const t = (r.tipoAccion || '').toUpperCase();
        return t === 'INSERT' || t === 'UPDATE' || t === 'DELETE';
      });
    }
    return this.registrosAuditoria.filter(r =>
      (r.tipoAccion || '').toUpperCase() === this.filtroTipo
    );
  }
}
