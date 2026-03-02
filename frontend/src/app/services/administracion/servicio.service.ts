import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Servicio {
  idTipoTramite: number;
  nombre: string;
  descripcion?: string;
  requiereRevision?: string;
  generaMulta?: boolean;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = 'http://localhost:8080/api/servicios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }
}
