import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AmbitoOperacional {
  ambitoOperacionalId: number | null;
  ambito: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AmbitoOperacionalService {

  // URL del backend para ámbito operacional
  private apiUrl = 'http://localhost:8080/api/ambito';

  constructor(private http: HttpClient) {}

  /** Obtener todos los ámbitos operacionales */
  listarAmbitosOperacionales(): Observable<AmbitoOperacional[]> {
    return this.http.get<AmbitoOperacional[]>(this.apiUrl);
  }

  /** Crear un nuevo ámbito operacional */
  crearAmbitoOperacional(ambito: AmbitoOperacional): Observable<AmbitoOperacional> {
    return this.http.post<AmbitoOperacional>(this.apiUrl, ambito);
  }

  /** Actualizar un ámbito operacional */
  actualizarAmbitoOperacional(id: number, ambito: AmbitoOperacional): Observable<AmbitoOperacional> {
    return this.http.put<AmbitoOperacional>(`${this.apiUrl}/${id}`, ambito);
  }
}
