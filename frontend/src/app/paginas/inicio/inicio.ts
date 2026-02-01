import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule,MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {

  sidebarCollapsed = false;
  sidebarOpen = false;
  nombreUsuario: string = 'Usuario';

  adminMenuOpen = false;

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

  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
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
