import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactoAdminRequest {
  usuario: string;
  mensaje?: string;
  motivo?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactoAdminService {
  private apiUrl = 'http://localhost:8080/api/contacto-admin';

  constructor(private http: HttpClient) {}

  enviarSolicitud(request: ContactoAdminRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
