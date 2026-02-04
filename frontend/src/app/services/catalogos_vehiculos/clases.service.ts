import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Clase {
  id: number | null;
  clase: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClasesService {
  private apiUrl = 'http://localhost:8080/api/clases';

  constructor(private http: HttpClient) {}

  listarClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(this.apiUrl);
  }

  crearClase(clase: Clase): Observable<Clase> {
    return this.http.post<Clase>(this.apiUrl, clase);
  }

  actualizarClase(id: number, clase: Clase): Observable<Clase> {
    return this.http.put<Clase>(`${this.apiUrl}/${id}`, clase);
  }
}
