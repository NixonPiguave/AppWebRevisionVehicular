import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface TipoDefecto {
  id: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: string;

}

@Injectable({
  providedIn: 'root'
})
export class TiposDefectosService {

  // URL del backend para tipos de defectos
  private apiUrl = 'http://localhost:8080/api/tipodefecto';

  constructor(private http: HttpClient) {}

  listar(): Observable<TipoDefecto[]> {
    return this.http.get<TipoDefecto[]>(this.apiUrl);
  }

  crear(tipoDefecto: TipoDefecto): Observable<TipoDefecto> {
    return this.http.post<TipoDefecto>(this.apiUrl, tipoDefecto);
  }

  actualizar(id: number, tipoDefecto: TipoDefecto): Observable<TipoDefecto> {
    return this.http.put<TipoDefecto>(`${this.apiUrl}/${id}`, tipoDefecto);
  }
}
