import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {

  sidebarCollapsed = false;   // desktop
  sidebarOpen = false;        // mobile

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      // comportamiento móvil
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      // comportamiento desktop
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

}
