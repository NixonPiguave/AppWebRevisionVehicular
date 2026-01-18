import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService) {}

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
        alert('Login correcto');
        // aquí luego redirigimos a Inicio
      },
      error: (err) => {
        this.error = err.error;
      }
    });
  }
}
