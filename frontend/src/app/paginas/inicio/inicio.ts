import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {

  sidebarCollapsed = false;   // Estado del sidebar en desktop (colapsado/expandido)
  sidebarOpen = false;        // Estado del sidebar en móvil (abierto/cerrado)
  nombreUsuario: string = 'Usuario';  // Nombre del usuario (puedes cambiarlo)

  ngOnInit() {
    // Verificar si estamos en móvil al cargar
    this.checkScreenSize();
  }

  /**
   * Toggle del sidebar - comportamiento diferente en móvil vs desktop
   */
  toggleSidebar() {
    if (this.isMobile()) {
      // En móvil: abrir/cerrar sidebar con overlay
      this.sidebarOpen = !this.sidebarOpen;

      // Prevenir scroll del body cuando el sidebar está abierto
      if (this.sidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      // En desktop: colapsar/expandir sidebar
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  /**
   * Cerrar el sidebar (usado principalmente en móvil)
   */
  closeSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  /**
   * Detectar si estamos en móvil
   */
  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Listener para cambios de tamaño de ventana
   */
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  /**
   * Verificar el tamaño de pantalla y ajustar estados
   */
  private checkScreenSize() {
    if (!this.isMobile()) {
      // Sí cambiamos a desktop, cerrar el sidebar móvil y restaurar scroll
      if (this.sidebarOpen) {
        this.sidebarOpen = false;
        document.body.style.overflow = '';
      }
    } else {
      // Sí cambiamos a móvil, resetear el estado colapsado
      if (this.sidebarCollapsed) {
        this.sidebarCollapsed = false;
      }
    }
  }

  /**
   * Listener para la tecla Escape (cerrar sidebar en móvil)
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
  }


  adminMenuOpen = false;  // Estado del submenú de Administración
  /**
   * Toggle del submenú de Administración
   */
  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
  }
}
