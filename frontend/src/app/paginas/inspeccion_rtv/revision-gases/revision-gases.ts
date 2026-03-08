import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revision-gases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revision-gases.html',
  styleUrl: './revision-gases.css',
})
export class RevisionGases {
  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/inicio/inspeccion-rtv/turnos-pagados']);
  }
}
