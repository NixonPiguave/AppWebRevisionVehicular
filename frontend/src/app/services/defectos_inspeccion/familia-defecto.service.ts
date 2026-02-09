import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Familia {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class FamiliaService {
  private apiUrl = 'http://localhost:8080/api/familias';

  constructor(private http: HttpClient) {}

  listarFamilias(): Observable<Familia[]> {
    return this.http.get<Familia[]>(this.apiUrl);
  }

  crearFamilia(familia: Familia): Observable<Familia> {
    return this.http.post<Familia>(this.apiUrl, familia);
  }

  actualizarFamilia(id: number, familia: Familia): Observable<Familia> {
    return this.http.put<Familia>(`${this.apiUrl}/${id}`, familia);
  }

  obtenerFamiliaPorId(id: number): Observable<Familia> {
    return this.http.get<Familia>(`${this.apiUrl}/${id}`);
  }

  eliminarFamilia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
