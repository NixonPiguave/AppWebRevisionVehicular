import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Propietario {
  idPropietario: number | null;
  documentoIdentidad: string;
  nombre: string;
  correo: string;
  telefono: number;
  direccion: string;
  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private apiUrl = 'http://localhost:8080/api/propietarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(this.apiUrl);
  }

  crear(propietario: Propietario): Observable<Propietario> {
    return this.http.post<Propietario>(this.apiUrl, propietario);
  }

  actualizar(id: number, propietario: Propietario): Observable<Propietario> {
    return this.http.put<Propietario>(`${this.apiUrl}/${id}`, propietario);
  }
}
