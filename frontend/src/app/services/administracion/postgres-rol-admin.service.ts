import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostgresTabla {
  esquema: string;
  nombreTabla: string;
}

/** Una fila del POST/PUT: permisos DML independientes por tabla. */
export interface TablaPermisosItem {
  esquema: string;
  nombreTabla: string;
  privilegioSelect: boolean;
  privilegioInsert: boolean;
  privilegioUpdate: boolean;
  privilegioDelete: boolean;
}

export interface CrearRolPostgresPayload {
  nombreRol: string;
  /** Solo tablas con al menos un privilegio true (el resto se omite). */
  permisosPorTabla: TablaPermisosItem[];
}

export interface SincronizarPrivilegiosPayload {
  nombreRol: string;
  /** Lista vacía = revocar en el catálogo sin nuevos GRANT. */
  permisosPorTabla: TablaPermisosItem[];
}

export interface PostgresTablaPrivilegioDetalle {
  esquema: string;
  nombreTabla: string;
  privilegioSelect: boolean;
  privilegioInsert: boolean;
  privilegioUpdate: boolean;
  privilegioDelete: boolean;
}

export interface PostgresRolPrivilegiosActuales {
  nombreRol: string;
  detallePorTabla: PostgresTablaPrivilegioDetalle[];
}

@Injectable({ providedIn: 'root' })
export class PostgresRolAdminService {
  private readonly apiUrl = 'http://localhost:8080/api/admin/postgres-roles';

  constructor(private http: HttpClient) {}

  obtenerPrivilegiosActuales(nombreRol: string): Observable<PostgresRolPrivilegiosActuales> {
    const enc = encodeURIComponent(nombreRol);
    return this.http.get<PostgresRolPrivilegiosActuales>(`${this.apiUrl}/${enc}/privilegios-actuales`);
  }

  /** Roles en pg_roles cuyo nombre empieza por rol_ (regex ~* '^rol_'). */
  listarRolesPrefijoRol(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }

  listarTablas(): Observable<PostgresTabla[]> {
    return this.http.get<PostgresTabla[]>(`${this.apiUrl}/tablas`);
  }

  crearRol(payload: CrearRolPostgresPayload): Observable<{ mensaje: string; rol: string }> {
    return this.http.post<{ mensaje: string; rol: string }>(this.apiUrl, payload);
  }

  sincronizarPrivilegios(payload: SincronizarPrivilegiosPayload): Observable<{ mensaje: string; rol: string }> {
    return this.http.put<{ mensaje: string; rol: string }>(`${this.apiUrl}/privilegios`, payload);
  }
}
