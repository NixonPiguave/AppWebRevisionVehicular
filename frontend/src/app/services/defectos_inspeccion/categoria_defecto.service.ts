import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaDefecto {
  id: number | null;
  subfamiliaId: number;
  codigo: string;
  estado: string;
  nombre: string;
  descripcion: string;
}

export interface SubfamiliaDefecto {
  id: number | null;
  familiaId: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaDefectoService {

  private apiUrl = 'http://localhost:8080/api/categoriasDefectos';
  private subFamiliasUrl = 'http://localhost:8080/api/subfamilias';

  constructor(private http: HttpClient) {}

  listar(): Observable<CategoriaDefecto[]> {
    return this.http.get<CategoriaDefecto[]>(this.apiUrl);
  }

  crear(categoria: CategoriaDefecto): Observable<CategoriaDefecto> {
    return this.http.post<CategoriaDefecto>(this.apiUrl, categoria);
  }

  actualizar(id: number, categoria: CategoriaDefecto): Observable<CategoriaDefecto> {
    return this.http.put<CategoriaDefecto>(`${this.apiUrl}/${id}`, categoria);
  }

  listarSubfamilias(): Observable<SubfamiliaDefecto[]> {
    return this.http.get<SubfamiliaDefecto[]>(this.subFamiliasUrl);
  }
}
