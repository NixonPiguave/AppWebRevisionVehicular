import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AmbitoOperacional {
  id: number | null;
  ambito: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AmbitoOperacionalService {
  private apiUrl = 'http://localhost:8080/api/ambito';

  constructor(private http: HttpClient) {}

  listarAmbitosOperacionales(): Observable<AmbitoOperacional[]> {
    return this.http.get<AmbitoOperacional[]>(this.apiUrl);
  }

  crearAmbitoOperacional(ambito: AmbitoOperacional): Observable<AmbitoOperacional> {
    return this.http.post<AmbitoOperacional>(this.apiUrl, ambito);
  }

  actualizarAmbitoOperacional(id: number, ambito: AmbitoOperacional): Observable<AmbitoOperacional> {
    return this.http.put<AmbitoOperacional>(`${this.apiUrl}/${id}`, ambito);
  }
}
