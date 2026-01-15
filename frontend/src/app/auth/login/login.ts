import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  usuario = '';
  password = '';
  hidePassword = true;
  error = '';

  constructor(private http: HttpClient) {}

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  login() {
    this.error = '';

    this.http.post(
      'http://localhost:8080/auth/login',
      {
        usuario: this.usuario,
        password: this.password
      },
      { responseType: 'text' }
    ).subscribe({
      next: () => alert('Login correcto'),
      error: (err) => this.error = err.error
    });
  }
}
