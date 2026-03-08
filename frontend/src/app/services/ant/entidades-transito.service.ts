import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EntidadTransito {
  idEntidad: number;
  codigo: string;
  nombre: string;
  nivel?: string;
  descripcion?: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class EntidadesTransitoService {
  private apiUrl = 'http://localhost:8080/api/entidadestransito';

  constructor(private http: HttpClient) {}

  listar(): Observable<EntidadTransito[]> {
    return this.http.get<EntidadTransito[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<EntidadTransito> {
    return this.http.get<EntidadTransito>(`${this.apiUrl}/${id}`);
  }
}
