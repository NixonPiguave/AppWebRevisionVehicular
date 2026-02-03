import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Area {
  areaId: number | null;
  nombre: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreasService {

  // URL del backend para áreas
  private apiUrl = 'http://localhost:8080/api/area';

  constructor(private http: HttpClient) {}


  /**Obtener todas las áreas*/

  listarAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }

  /** Crear una nueva área*/
  crearArea(area: Area): Observable<Area> {
    return this.http.post<Area>(this.apiUrl, area);
  }

  /**Actualizar un área*/
  actualizarArea(id: number, area: Area): Observable<Area> {
    return this.http.put<Area>(`${this.apiUrl}/${id}`, area);
  }

}
