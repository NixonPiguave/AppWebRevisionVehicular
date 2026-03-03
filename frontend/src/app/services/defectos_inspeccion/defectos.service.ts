import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Defectos {
  id: number | null;
  codigo: string;
  descripcion: string;
  puntoDeTrabajo: string;
  maquinaria: string;
  procedimientos: string;
  descripciontipo: string;
  observaciones: string;
  estado: string;
  tipoDefectoId: number;
  subfamiliaId: number;
  categoriaId: number;

  nombrecategoria?: string;
  nombrefamilia?: string;
  nombreSubfamilia?: string;
  nombretipodefecto?: string;
}

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

export interface Familia {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

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
export class DefectosService {

  private apiUrl = 'http://localhost:8080/api/defectos';
  private subFamiliasUrl = 'http://localhost:8080/api/subfamilias';
  private categoriaUrl = 'http://localhost:8080/api/categoriasDefectos';
  private familiaUrl = 'http://localhost:8080/api/familias';
  private tipoDefectoUrl = 'http://localhost:8080/api/tipodefecto';

  constructor(private http: HttpClient) {}

  listar(): Observable<Defectos[]> {
    return this.http.get<Defectos[]>(this.apiUrl);
  }

  crear(defecto: Defectos): Observable<Defectos> {
    return this.http.post<Defectos>(this.apiUrl, defecto);
  }

  actualizar(id: number, defecto: Defectos): Observable<Defectos> {
    return this.http.put<Defectos>(`${this.apiUrl}/${id}`, defecto);
  }

  listarSubfamilias(): Observable<SubfamiliaDefecto[]> {
    return this.http.get<SubfamiliaDefecto[]>(this.subFamiliasUrl);
  }

  listarCategorias(): Observable<CategoriaDefecto[]> {
    return this.http.get<CategoriaDefecto[]>(this.categoriaUrl);
  }

  listarFamilias(): Observable<Familia[]> {
    return this.http.get<Familia[]>(this.familiaUrl);
  }

  listarTipoDefectos(): Observable<TipoDefecto[]> {
    return this.http.get<TipoDefecto[]>(this.tipoDefectoUrl);
  }
}
