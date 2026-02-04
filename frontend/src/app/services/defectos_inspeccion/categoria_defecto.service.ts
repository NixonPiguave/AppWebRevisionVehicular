import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaDefecto {
  rtvcategoriaId: number | null;
  subfamiliaId: number;
  codigo: string;
  estado: string;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaDefectoService {

  // URL del backend para categorias de defecto
  private apiUrl = 'http://localhost:8080/api/categoria-defecto';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las categorías de defecto
   */
  listarCategorias(): Observable<CategoriaDefecto[]> {
    return this.http.get<CategoriaDefecto[]>(this.apiUrl);
  }

  /**
   * Crear una nueva categoría de defecto
   */
  crearCategoria(categoria: CategoriaDefecto): Observable<CategoriaDefecto> {
    return this.http.post<CategoriaDefecto>(this.apiUrl, categoria);
  }

  /**
   * Actualizar una categoría de defecto
   */
  actualizarCategoria(id: number, categoria: CategoriaDefecto): Observable<CategoriaDefecto> {
    return this.http.put<CategoriaDefecto>(`${this.apiUrl}/${id}`, categoria);
  }
}
