import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private router: Router
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
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.error = err.error;
      }
    });
  }
}
