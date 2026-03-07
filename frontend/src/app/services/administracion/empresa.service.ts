import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Empresa {
  empresaId: number | null;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  logoempresa: string;    // URL Cloudinary del logo
  ruc: string;
  iconoempresa: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = 'http://localhost:8080/api/empresa';  // ← corregido: sin paréntesis

  constructor(private http: HttpClient) {}

  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  // Devuelve la primera empresa registrada (la empresa del sistema)
  obtenerPrimera(): Observable<Empresa | null> {
    return this.listarEmpresas().pipe(
      map(lista => lista.length > 0 ? lista[0] : null)
    );
  }

  crearEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  actualizarEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }
}
