import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  usuario = '';
  password = '';
  hidePassword = true;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  login() {
    this.error = '';

    const request: LoginRequest = {
      usuario: this.usuario,
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: () => {
        // Login correcto → redirigir
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        // Mostrar error inmediatamente
        this.error = err.error;
        this.cdr.detectChanges(); // fuerza actualización de la vista
      }
    });
  }
}
