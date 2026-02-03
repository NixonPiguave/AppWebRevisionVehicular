import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empresa {
  empresaId: number | null;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  logoempresa: string;
  ruc: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = 'http://localhost:8080/(api/empresa)';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las empresas
   */
  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  /**
   * Crear una nueva empresa
   */
  crearEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  /**
   * Actualizar una empresa existente
   */
  actualizarEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }

}
