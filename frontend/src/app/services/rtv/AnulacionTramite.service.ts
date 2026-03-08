import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnulacionTramite {
  idAnulacionSrv?: number | null;
  tramiteAnuladoId: number | null;
  entidadId: number | null;
  usuarioId?: number | null;
  numeroTramiteAnulado: string;
  estadoTramiteAlAnular: string;
  motivoAnulacion: string;
  documentosSoporte?: string | null;
  pagosRevertidos: string;
  multasDevueltas: string;
  estado: string;
  fechaAnulacion?: string;
}

@Injectable({ providedIn: 'root' })
export class AnulacionTramiteService {
  private apiUrl = 'http://localhost:8080/api/anulacion-tramites';

  constructor(private http: HttpClient) {}

  listar(): Observable<AnulacionTramite[]> {
    return this.http.get<AnulacionTramite[]>(this.apiUrl);
  }

  crear(dto: AnulacionTramite): Observable<AnulacionTramite> {
    return this.http.post<AnulacionTramite>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: AnulacionTramite): Observable<AnulacionTramite> {
    return this.http.put<AnulacionTramite>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
