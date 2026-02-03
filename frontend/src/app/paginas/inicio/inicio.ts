import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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

  // Estado de expansión para cada sección principal
  gestionVehicularOpen = false;
  operacionesOpen = false;
  catalogoVehiculosOpen = false;
  inspeccionRtvOpen = false;
  defectosInspeccionOpen = false;
  antTramitesOpen = false;
  configuracionUmbralOpen = false;
  administracionOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkScreenSize();
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
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  // Métodos para toggle de cada sección (comportamiento acordeón)
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

  // Cerrar todas las secciones excepto la que se está abriendo
  private closeAllExcept(sectionName: string) {
    if (sectionName !== 'gestionVehicular') this.gestionVehicularOpen = false;
    if (sectionName !== 'operaciones') this.operacionesOpen = false;
    if (sectionName !== 'catalogoVehiculos') this.catalogoVehiculosOpen = false;
    if (sectionName !== 'inspeccionRtv') this.inspeccionRtvOpen = false;
    if (sectionName !== 'defectosInspeccion') this.defectosInspeccionOpen = false;
    if (sectionName !== 'antTramites') this.antTramitesOpen = false;
    if (sectionName !== 'configuracionUmbral') this.configuracionUmbralOpen = false;
    if (sectionName !== 'administracion') this.administracionOpen = false;
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
