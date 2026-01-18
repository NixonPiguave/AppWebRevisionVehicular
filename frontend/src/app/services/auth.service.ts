import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<string> {
    return this.http.post(
      `${this.API_URL}/login`,
      request,
      { responseType: 'text' }
    );
  }
}
