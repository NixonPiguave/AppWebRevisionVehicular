import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DescripcionUmbral {
  idDescripcionUmbral: number | null;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class DescripcionUmbralService {

  private apiUrl = 'http://localhost:8080/api/descripcionumbral';

  constructor(private http: HttpClient) {}

  listarDescripcionUmbral(): Observable<DescripcionUmbral[]> {
    return this.http.get<DescripcionUmbral[]>(this.apiUrl);
  }

  crearDescripcionUmbral(descripcion: DescripcionUmbral): Observable<DescripcionUmbral> {
    return this.http.post<DescripcionUmbral>(this.apiUrl, descripcion);
  }

  actualizarDescripcionUmbral(id: number, descripcion: DescripcionUmbral): Observable<DescripcionUmbral> {
    return this.http.put<DescripcionUmbral>(`${this.apiUrl}/${id}`, descripcion);
  }

  obtenerDescripcionUmbralPorId(id: number): Observable<DescripcionUmbral> {
    return this.http.get<DescripcionUmbral>(`${this.apiUrl}/${id}`);
  }

  eliminarDescripcionUmbral(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
