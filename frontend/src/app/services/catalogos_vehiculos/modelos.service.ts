import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Marca {
  id: number | null;
  nombre: string;
  empresa: string;
  paisOrigen: string;
  grupoAutomotriz: string;
  fechaAlta: string | null;
  fechaBaja: string | null;
  logoUrl: string;
  estado: string;
}

export interface Modelo {
  id:number;
  nombre: string;
  anioDesde: number;
  anioHasta: number;
  estado: string;

  marcaId: number;

  // Campos auxiliares para mostrar nombres en la tabla no se si usarlo
  marcaNombre?: string;

}

@Injectable({
  providedIn: 'root'
})
export class ModeloService {
  private apiUrl = 'http://localhost:8080/api/modelos';
  private marcasUrl = 'http://localhost:8080/api/marcas';


  constructor(private http: HttpClient) { }

  listar(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(this.apiUrl);
  }


  crear(modelo: Modelo): Observable<Modelo> {
    return this.http.post<Modelo>(this.apiUrl, modelo);
  }

  actualizarUsuario(id: number, modelo: Modelo): Observable<Modelo> {
    return this.http.put<Modelo>(`${this.apiUrl}/${id}`, modelo);
  }

  obtenerID(id: number): Observable<Modelo> {
    return this.http.get<Modelo>(`${this.apiUrl}/${id}`);
  }

  // Cargar datos para los selects
  listarMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.marcasUrl);
  }
}
