import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  NAVIGATION,
  NavigationGroup,
  NavigationItem,
  NavigationSection,
  configurationSection,
  configurationSections,
} from './navigation';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services/administracion/empresa.service';
import { MatIconModule } from '@angular/material/icon';
import { BackupService, EstadoBdRestore } from '../../services/backup/backup.service';
import { ChatInternoPanelComponent } from '../../components/chat-interno-panel/chat-interno-panel';
import { ChatInternoService } from '../../services/chat-interno.service';

const PRIMER_CHECK_SESION_MS = 5000;
const PRIMER_CHAT_SIN_LEER_MS = 4000;
const INTERVALO_CHAT_SIN_LEER_MS = 20000;
const INTERVALO_CHECK_SESION_MS = 15000;

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ChatInternoPanelComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit, OnDestroy {
  busquedaMenu = '';
  seccionConfigAbierta = '';
  seccionesConfiguracion(group: NavigationGroup): NavigationSection[] {
    return configurationSections(group.items);
  }
  trackSection(_index: number, section: NavigationSection): string {
    return section.label;
  }
  seccionActiva(section: NavigationSection): boolean {
    return section.items.some((item) => item.route === this.rutaActual);
  }
  abrirSeccion(label: string): void {
    this.seccionConfigAbierta = this.seccionConfigAbierta === label ? '' : label;
  }
  trackGroup(_index: number, group: NavigationGroup): string {
    return group.label;
  }
  trackItem(_index: number, item: NavigationItem): string {
    return item.route;
  }
  get mostrarFlujo(): boolean {
    return /\/operaciones\/|\/administracion\/turnos$|\/inspeccion-rtv\/turnos-pagados$/.test(
      this.rutaActual,
    );
  }
  get accesosInicio(): NavigationGroup[] {
    return this.gruposVisibles.filter(
      (group) => !['Inicio', 'Configuración'].includes(group.label),
    );
  }
  grupoAbierto = 'Inicio';
  rutaActual = '';
  private navigationSub?: Subscription;

  get gruposVisibles(): NavigationGroup[] {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
    const query = normalize(this.busquedaMenu.trim());
    return NAVIGATION.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.permissions.length || this.puedeVerCualquiera(...item.permissions)) &&
          (!item.parentPermission || this.puedeVer(item.parentPermission)) &&
          (!query ||
            normalize(
              group.label +
                ' ' +
                item.label +
                ' ' +
                (group.label === 'Configuración' ? configurationSection(item) : ''),
            ).includes(query)),
      ),
    })).filter((group) => group.items.length > 0);
  }

  grupoActivo(group: NavigationGroup): boolean {
    return (
      group.items.some((item) => this.rutaActual === item.route) ||
      (group.label === 'Inspecciones' &&
        /inspeccion-rtv\/(registrar|revision-)/.test(this.rutaActual))
    );
  }

  abrirGrupo(group: NavigationGroup): void {
    this.sidebarCollapsed = false;
    if (group.items.length === 1) {
      this.router.navigateByUrl(group.items[0].route);
      this.closeSidebar();
    }
    this.grupoAbierto = this.grupoAbierto === group.label ? '' : group.label;
  }

  get tituloPagina(): string {
    return (
      NAVIGATION.flatMap((group) => group.items).find((item) => item.route === this.rutaActual)
        ?.label ?? 'Revisión del vehículo'
    );
  }

  get enInspeccion(): boolean {
    return /inspeccion-rtv\/(registrar|revision-)/.test(this.rutaActual);
  }

  private sincronizarNavegacion(): void {
    this.rutaActual = this.router.url.split('?')[0];
    this.grupoAbierto = this.gruposVisibles.find((group) => this.grupoActivo(group))?.label ?? '';
    const configItem = NAVIGATION.find((group) => group.label === 'Configuración')?.items.find(
      (item) => item.route === this.rutaActual,
    );
    if (configItem) this.seccionConfigAbierta = configurationSection(configItem);
    if (this.enInspeccion && !this.isMobile()) this.sidebarCollapsed = true;
    this.closeSidebar();
    this.cdr.markForCheck();
  }

  sidebarCollapsed = false;
  sidebarOpen = false;
  nombreUsuario: string = 'Usuario';
  rolUsuario: string = '';
  menuUsuarioAbierto: boolean = false;
  /** Panel lateral de chat interno (header). */
  chatAbierto = false;
  /** Total de mensajes sin leer (badge en icono de chat). */
  chatSinLeerTotal = 0;

  @ViewChild('userMenu', { static: false }) userMenu?: ElementRef<HTMLElement>;

  //  Variables para ícono dinámico
  empresaIcono: string | null = null;
  empresaNombre: string = 'RTV';
  cargandoIcono: boolean = true;

  private checkSesionSubscription: Subscription | null = null;
  private chatSinLeerSub: Subscription | null = null;
  private chatSinLeerPollSub: Subscription | null = null;
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
    private chatInternoService: ChatInternoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.sincronizarNavegacion();
    this.navigationSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.sincronizarNavegacion();
    });
    this.cargarIconoEmpresa();
    this.nombreUsuario = this.authService.getNombre() ?? this.authService.getUsuario() ?? 'Usuario';
    this.rolUsuario = this.authService.getRol() ?? '';
    if (this.authService.getToken()) {
      this.checkSesionSubscription = timer(PRIMER_CHECK_SESION_MS, INTERVALO_CHECK_SESION_MS)
        .pipe(switchMap(() => this.authService.checkSession()))
        .subscribe();
      this.validarEstadoBaseDatos();
      this.chatInternoService.refrescarSinLeer();
      this.chatSinLeerSub = this.chatInternoService.sinLeer$.subscribe((r) => {
        this.chatSinLeerTotal = r?.totalSinLeer ?? 0;
        this.cdr.markForCheck();
      });
      this.chatSinLeerPollSub = timer(
        PRIMER_CHAT_SIN_LEER_MS,
        INTERVALO_CHAT_SIN_LEER_MS,
      ).subscribe(() => {
        this.chatInternoService.refrescarSinLeer();
      });
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
    this.navigationSub?.unsubscribe();
    this.checkSesionSubscription?.unsubscribe();
    this.checkSesionSubscription = null;
    this.chatSinLeerSub?.unsubscribe();
    this.chatSinLeerSub = null;
    this.chatSinLeerPollSub?.unsubscribe();
    this.chatSinLeerPollSub = null;
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
      const nav = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined;
      if (nav?.type === 'reload') return;
    } catch {
      /* ignorar */
    }
    if (this.authService.isLoggedIn()) {
      this.authService.notifyServerLogoutBeacon();
    }
  }

  etiquetaChatSinLeer(): string {
    if (this.chatSinLeerTotal > 99) return '99+';
    return String(this.chatSinLeerTotal);
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
      },
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
        this.mensajeInfo =
          'Base de datos restaurada. Cierra sesión y vuelve a ingresar para recargar todos los módulos.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorRestoreBd =
          err?.error?.message || err?.message || 'No se pudo restaurar la base de datos.';
        this.restaurandoBd = false;
        this.cdr.detectChanges();
      },
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
    return keys.some((k) => permisos.includes(k));
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
      },
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
    if (this.chatAbierto) {
      this.chatAbierto = false;
      return;
    }
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
      },
    });
  }

  private limpiarYRedirigir(): void {
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
