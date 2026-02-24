import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subcategoria {
  id: number | null;
  codigoSubcategoria: string;
  nombre: string;
  descripcion: string;
  estado: string;
  categoriaId: number;
  codigo?: string;
}
export interface Categoria {
  categoriaid: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: string;
}
@Injectable({
  providedIn: 'root'
})
export class SubcategoriasService {
  private apiUrl = 'http://localhost:8080/api/subcategorias';
  private catUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  listar(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(this.apiUrl);
  }
  crear(subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(this.apiUrl, subcategoria);
  }
  actualizar(id: number, subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.apiUrl}/${id}`, subcategoria);
  }
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.catUrl);
  }
}
