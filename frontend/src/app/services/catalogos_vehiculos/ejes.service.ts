import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Eje {
  id: number | null;
  cantidad: number | null;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class EjesService {
  private apiUrl = 'http://localhost:8080/api/ejes';

  constructor(private http: HttpClient) {}

  listarEjes(): Observable<Eje[]> {
    return this.http.get<Eje[]>(this.apiUrl);
  }

  crearEje(eje: Eje): Observable<Eje> {
    return this.http.post<Eje>(this.apiUrl, eje);
  }

  actualizarEje(id: number, eje: Eje): Observable<Eje> {
    return this.http.put<Eje>(`${this.apiUrl}/${id}`, eje);
  }
}
