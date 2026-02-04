import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Linea {
  lineaId: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class LineasService {

  private apiUrl = 'http://localhost:8080/api/lineas';

  constructor(private http: HttpClient) {}

  listarLineas(): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.apiUrl);
  }

  crearLinea(linea: Linea): Observable<Linea> {
    return this.http.post<Linea>(this.apiUrl, linea);
  }

  actualizarLinea(id: number, linea: Linea): Observable<Linea> {
    return this.http.put<Linea>(`${this.apiUrl}/${id}`, linea);
  }
}
