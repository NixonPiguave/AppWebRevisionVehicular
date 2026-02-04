import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Marca {
  id: number | null;
  nombre: string;
  empresa: string;
  grupoAutomotriz: string;
  paisOrigen: string;
  logoUrl: string;
  estado: string;
  fechaAlta?: string;
  fechaBaja?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarcasService {

  private apiUrl = 'http://localhost:8080/api/marcas';

  constructor(private http: HttpClient) {}

  listarMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.apiUrl);
  }

  crearMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(this.apiUrl, marca);
  }

  actualizarMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
  }

  eliminarMarca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
