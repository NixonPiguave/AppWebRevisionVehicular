import { Component, HostListener, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services/administracion/empresa.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {

  sidebarCollapsed = false;
  sidebarOpen = false;
  nombreUsuario: string = 'Usuario';
  rolUsuario: string = '';
  menuUsuarioAbierto: boolean = false;

  @ViewChild('userMenu', { static: false }) userMenu?: ElementRef<HTMLElement>;

  //  Variables para ícono dinámico
  empresaIcono: string | null = null;
  empresaNombre: string = 'RTV';
  cargandoIcono: boolean = true;

  // Estado de expansión para cada sección principal
  gestionVehicularOpen = false;
  operacionesOpen = false;
  catalogoVehiculosOpen = false;
  inspeccionRtvOpen = false;
  defectosInspeccionOpen = false;
  antTramitesOpen = false;
  configuracionUmbralOpen = false;
  administracionOpen = false;
  accesosRapidosOpen = false;

  constructor(
    private authService: AuthService,
    private empresaService: EmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.cargarIconoEmpresa();
    this.nombreUsuario = this.authService.getNombre() ?? this.authService.getUsuario() ?? 'Usuario';
    this.rolUsuario = this.authService.getRol() ?? '';
  }

  /**
   * Indica si el usuario puede ver la opción de menú con la clave dada.
   * Si no hay permisos configurados (null o []), se muestran todas las opciones.
   */
  puedeVer(permisoKey: string): boolean {
    const permisos = this.authService.getPermisos();
    if (!permisos || permisos.length === 0) return true;
    return permisos.includes(permisoKey);
  }

  /** Muestra la sección si el usuario tiene al menos uno de los permisos. */
  puedeVerCualquiera(...keys: string[]): boolean {
    const permisos = this.authService.getPermisos();
    if (!permisos || permisos.length === 0) return true;
    return keys.some(k => permisos.includes(k));
  }

   // Cargar ícono de empresa para sidebar
  cargarIconoEmpresa(): void {
    this.empresaService.listarEmpresas().subscribe({
      next: (empresas) => {
        if (empresas.length > 0) {
          const empresa = empresas[0];

          // Si tiene ícono de Cloudinary, usarlo
          if (empresa.iconoempresa && empresa.iconoempresa.startsWith('http')) {
            this.empresaIcono = empresa.iconoempresa;
            console.log('[INICIO] Ícono de empresa cargado:', this.empresaIcono);
          }

          // Usar nombre corto de la empresa (opcional)
          if (empresa.nombre) {
            // Puedes usar las iniciales o nombre completo
            this.empresaNombre = empresa.nombre.substring(0, 3).toUpperCase();
          }
        }

        this.cargandoIcono = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('[INICIO] No se pudo cargar ícono de empresa:', err);
        // No es crítico, usar ícono por defecto
        this.cargandoIcono = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen = !this.sidebarOpen;
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleAccesosRapidos() {
    this.closeAllExcept('accesosRapidos');
    this.accesosRapidosOpen = !this.accesosRapidosOpen;
  }

  irATramiteRapido(servicioId: number) {
    const rutasServicios: { [key: number]: string } = {
      9:  '/inicio/gestion_vehicular/bloqueo-vehiculo',
      10: '/inicio/gestion_vehicular/desbloqueo-vehiculo',
      11: '/inicio/gestion_vehicular/registro-observaciones',
      12: '/inicio/gestion_vehicular/baja-vehiculo',
    };

    const ruta = rutasServicios[servicioId];
    if (ruta) {
      this.router.navigate([ruta]);
    }
  }

  closeSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (!this.isMobile()) {
      if (this.sidebarOpen) {
        this.sidebarOpen = false;
        document.body.style.overflow = '';
      }
    } else {
      if (this.sidebarCollapsed) {
        this.sidebarCollapsed = false;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
    if (this.menuUsuarioAbierto) {
      this.menuUsuarioAbierto = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.menuUsuarioAbierto) return;
    const target = event.target as Node | null;
    const hostEl = this.userMenu?.nativeElement;
    if (!hostEl || !target) return;
    if (!hostEl.contains(target)) {
      this.menuUsuarioAbierto = false;
    }
  }

  toggleMenuUsuario(event: MouseEvent) {
    event.stopPropagation();
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  toggleGestionVehicular() {
    this.closeAllExcept('gestionVehicular');
    this.gestionVehicularOpen = !this.gestionVehicularOpen;
  }

  toggleOperaciones() {
    this.closeAllExcept('operaciones');
    this.operacionesOpen = !this.operacionesOpen;
  }

  toggleCatalogoVehiculos() {
    this.closeAllExcept('catalogoVehiculos');
    this.catalogoVehiculosOpen = !this.catalogoVehiculosOpen;
  }

  toggleInspeccionRtv() {
    this.closeAllExcept('inspeccionRtv');
    this.inspeccionRtvOpen = !this.inspeccionRtvOpen;
  }

  toggleDefectosInspeccion() {
    this.closeAllExcept('defectosInspeccion');
    this.defectosInspeccionOpen = !this.defectosInspeccionOpen;
  }

  toggleAntTramites() {
    this.closeAllExcept('antTramites');
    this.antTramitesOpen = !this.antTramitesOpen;
  }

  toggleConfiguracionUmbral() {
    this.closeAllExcept('configuracionUmbral');
    this.configuracionUmbralOpen = !this.configuracionUmbralOpen;
  }

  toggleAdministracion() {
    this.closeAllExcept('administracion');
    this.administracionOpen = !this.administracionOpen;
  }

  private closeAllExcept(sectionName: string) {
    if (sectionName !== 'gestionVehicular') this.gestionVehicularOpen = false;
    if (sectionName !== 'operaciones') this.operacionesOpen = false;
    if (sectionName !== 'catalogoVehiculos') this.catalogoVehiculosOpen = false;
    if (sectionName !== 'inspeccionRtv') this.inspeccionRtvOpen = false;
    if (sectionName !== 'defectosInspeccion') this.defectosInspeccionOpen = false;
    if (sectionName !== 'antTramites') this.antTramitesOpen = false;
    if (sectionName !== 'configuracionUmbral') this.configuracionUmbralOpen = false;
    if (sectionName !== 'administracion') this.administracionOpen = false;
    if (sectionName !== 'accesosRapidos') this.accesosRapidosOpen = false; // ← nueva línea
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.limpiarYRedirigir(),
      error: () => this.limpiarYRedirigir()
    });
  }

  private limpiarYRedirigir(): void {
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
