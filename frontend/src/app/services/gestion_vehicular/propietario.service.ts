
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Propietario {
  idPropietario: number | null;
  nombre: string;
  correo: string;
  direccion: string;

  documentoIdentidad:string;
  telefono: number;


  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TraccionService {
  // private apiUrl = 'http://localhost:8080/api/tracciones';
  //
  // constructor(private http: HttpClient) {}
  //
  // listar(): Observable<Traccion[]> {
  //   return this.http.get<Traccion[]>(this.apiUrl);
  // }
  //
  // crear(traccion: Traccion): Observable<Traccion> {
  //   return this.http.post<Traccion>(this.apiUrl, traccion);
  // }
  //
  // actualizar(id: number, traccion: Traccion): Observable<Traccion> {
  //   return this.http.put<Traccion>(`${this.apiUrl}/${id}`, traccion);
  // }

}
