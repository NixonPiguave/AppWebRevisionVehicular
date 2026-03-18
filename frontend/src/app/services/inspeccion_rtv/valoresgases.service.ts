import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValoresMedidosGases {
  co?: string;
  hc?: string;
  lambda?: string;
  o2?: string;
  opacidad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValoresgasesService {

  private apiUrl = 'http://localhost:8080/api/aleatorio';

  constructor(private http: HttpClient) {}

  obtenerValoresAleatorios(tipoCombustible: 'GASOLINA' | 'DIESEL'): Observable<ValoresMedidosGases> {
    const params = new HttpParams().set('tipoCombustible', tipoCombustible);
    return this.http.get<ValoresMedidosGases>(`${this.apiUrl}/valoresgases`, { params });
  }
}
