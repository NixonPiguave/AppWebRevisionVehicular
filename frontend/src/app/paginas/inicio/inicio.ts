import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services/administracion/empresa.service';
import { MatIconModule } from '@angular/material/icon';
import { BackupService, EstadoBdRestore } from '../../services/backup/backup.service';

const PRIMER_CHECK_SESION_MS = 5000;
const INTERVALO_CHECK_SESION_MS = 15000;

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit, OnDestroy {

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

  private checkSesionSubscription: Subscription | null = null;
  /** Mensaje informativo (ej. "Has iniciado sesión desde otro dispositivo") que se oculta solo. */
  mensajeInfo = '';
  private mensajeInfoTimeout: ReturnType<typeof setTimeout> | null = null;
  modalRestoreVisible = false;
  estadoRestore: EstadoBdRestore | null = null;
  archivoRestoreSeleccionado: File | null = null;
  nombreArchivoRestore = '';
  restaurandoBd = false;
  errorRestoreBd = '';
  exitoRestoreBd = '';

  constructor(
    private authService: AuthService,
    private empresaService: EmpresaService,
    private backupService: BackupService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.cargarIconoEmpresa();
    this.nombreUsuario = this.authService.getNombre() ?? this.authService.getUsuario() ?? 'Usuario';
    this.rolUsuario = this.authService.getRol() ?? '';
    if (this.authService.getToken()) {
      this.checkSesionSubscription = timer(PRIMER_CHECK_SESION_MS, INTERVALO_CHECK_SESION_MS).pipe(
        switchMap(() => this.authService.checkSession())
      ).subscribe();
      this.validarEstadoBaseDatos();
    }
    const infoMsg = sessionStorage.getItem('authInfoMessage');
    if (infoMsg) {
      sessionStorage.removeItem('authInfoMessage');
      this.mensajeInfo = infoMsg;
      this.mensajeInfoTimeout = setTimeout(() => {
        this.mensajeInfo = '';
        this.mensajeInfoTimeout = null;
        this.cdr.detectChanges();
      }, 6000);
    }
  }

  ngOnDestroy() {
    this.checkSesionSubscription?.unsubscribe();
    this.checkSesionSubscription = null;
    if (this.mensajeInfoTimeout) {
      clearTimeout(this.mensajeInfoTimeout);
      this.mensajeInfoTimeout = null;
    }
    if (this.modalRestoreVisible) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Al cerrar la pestaña/navegar fuera, avisa al servidor para marcar la sesión como cerrada.
   * No se ejecuta en recarga (F5) para no desconectar al usuario.
   */
  @HostListener('window:pagehide', ['$event'])
  onWindowPageHide(ev: PageTransitionEvent): void {
    if (ev.persisted) return;
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === 'reload') return;
    } catch {
      /* ignorar */
    }
    if (this.authService.isLoggedIn()) {
      this.authService.notifyServerLogoutBeacon();
    }
  }

  cerrarMensajeInfo(): void {
    this.mensajeInfo = '';
    if (this.mensajeInfoTimeout) {
      clearTimeout(this.mensajeInfoTimeout);
      this.mensajeInfoTimeout = null;
    }
    this.cdr.detectChanges();
  }

  private validarEstadoBaseDatos(): void {
    this.backupService.estadoBdRestore().subscribe({
      next: (estado) => {
        this.estadoRestore = estado;
        if (estado?.requiereRestauracion) {
          this.modalRestoreVisible = true;
          this.errorRestoreBd = '';
          this.exitoRestoreBd = '';
          document.body.style.overflow = 'hidden';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Si no se pudo verificar, no bloqueamos el flujo normal.
      }
    });
  }

  onSeleccionarArchivoRestore(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files.length > 0 ? input.files[0] : null;
    this.archivoRestoreSeleccionado = file;
    this.nombreArchivoRestore = file?.name ?? '';
    this.errorRestoreBd = '';
    this.exitoRestoreBd = '';
  }

  ejecutarRestoreDesdeModal(): void {
    if (!this.archivoRestoreSeleccionado) {
      this.errorRestoreBd = 'Seleccione un archivo .backup para continuar.';
      return;
    }
    if (!this.archivoRestoreSeleccionado.name.toLowerCase().endsWith('.backup')) {
      this.errorRestoreBd = 'El archivo debe tener extensión .backup.';
      return;
    }
    this.restaurandoBd = true;
    this.errorRestoreBd = '';
    this.exitoRestoreBd = '';
    this.backupService.ejecutarRestoreUpload(this.archivoRestoreSeleccionado).subscribe({
      next: (res) => {
        this.exitoRestoreBd = res?.mensaje || 'Restauración completada correctamente.';
        this.modalRestoreVisible = false;
        this.archivoRestoreSeleccionado = null;
        this.nombreArchivoRestore = '';
        this.restaurandoBd = false;
        document.body.style.overflow = '';
        this.mensajeInfo = 'Base de datos restaurada. Cierra sesión y vuelve a ingresar para recargar todos los módulos.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorRestoreBd = err?.error?.message || err?.message || 'No se pudo restaurar la base de datos.';
        this.restaurandoBd = false;
        this.cdr.detectChanges();
      }
    });
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

  cerrandoSesion = false;

  cerrarSesion(): void {
    if (this.cerrandoSesion) return;
    this.cerrandoSesion = true;
    this.authService.logout().subscribe({
      next: () => {
        this.cerrandoSesion = false;
        this.limpiarYRedirigir();
      },
      error: () => {
        this.cerrandoSesion = false;
        this.limpiarYRedirigir();
      }
    });
  }

  private limpiarYRedirigir(): void {
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
