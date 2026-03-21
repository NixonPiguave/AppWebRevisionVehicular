import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CriterioResultado {
  criterioId?: number;
  tipo1Rechaza?: boolean;
  tipo2Rechaza?: boolean;
  tipo3Rechaza?: boolean;
  tipo1Max?: number | string | null;
  tipo2Max?: number | string | null;
  tipo3Max?: number | string | null;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class CriterioResultadoService {
  private api = 'http://localhost:8080/api/criterio-resultado';

  constructor(private http: HttpClient) {}

  obtener(): Observable<CriterioResultado> {
    return this.http.get<CriterioResultado>(this.api);
  }

  guardar(dto: CriterioResultado): Observable<CriterioResultado> {
    return this.http.put<CriterioResultado>(this.api, dto);
  }
}
