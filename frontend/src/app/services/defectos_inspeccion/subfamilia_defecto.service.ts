import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubfamiliaDefecto {
  id: number | null;
  familiaId: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

export interface Familia {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}
@Injectable({
  providedIn: 'root'
})
export class SubfamiliaDefectoService {

  private apiUrl = 'http://localhost:8080/api/subfamilias';
  private familiasUrl = 'http://localhost:8080/api/familias';

  constructor(private http: HttpClient) {}


  listar(): Observable<SubfamiliaDefecto[]> {
    return this.http.get<SubfamiliaDefecto[]>(this.apiUrl);
  }


  crear(subfamiliaDefecto: SubfamiliaDefecto): Observable<SubfamiliaDefecto> {
    return this.http.post<SubfamiliaDefecto>(this.apiUrl, subfamiliaDefecto);
  }


  actualizar(id: number, subfamiliaDefecto: SubfamiliaDefecto): Observable<SubfamiliaDefecto> {
    return this.http.put<SubfamiliaDefecto>(`${this.apiUrl}/${id}`, subfamiliaDefecto);
  }

  listarFamilias(): Observable<Familia[]> {
    return this.http.get<Familia[]>(this.familiasUrl);
  }

}
