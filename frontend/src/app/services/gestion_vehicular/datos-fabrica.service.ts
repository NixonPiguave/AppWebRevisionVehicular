import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DatosFabrica {
  id?: number;
  matricula: string;
  chasis: string;
  vin: string;
  marca: string;
  modelo: string;
  color?: string;
  anioFabricacion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatosFabricaService {

  private apiUrl = 'http://localhost:8080/api/datos-fabrica';

  constructor(private http: HttpClient) {}

  /**
   * Busca datos de fábrica por matrícula (placa).
   * Usado en inspección visual para comparar con datos del vehículo.
   * Retorna null si no se encuentra (404).
   */
  buscarPorMatricula(matricula: string): Observable<DatosFabrica | null> {
    if (!matricula || !matricula.trim()) {
      return of(null);
    }
    const url = `${this.apiUrl}/buscar?matricula=${encodeURIComponent(matricula.trim())}`;
    return this.http.get<DatosFabrica>(url).pipe(
      catchError(() => of(null))
    );
  }
}
