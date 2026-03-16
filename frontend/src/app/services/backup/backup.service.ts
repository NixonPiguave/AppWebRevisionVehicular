import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BackupConfig {
  configId?: number;
  rutaServidor: string;
  driveFolderId?: string;
  driveCredentialsPath?: string;
  driveHabilitado: boolean;
  cronFull?: string;
  cronDiferencial?: string;
  cronIncremental?: string;
  schedulerActivo: boolean;
  emailNotificacion?: string;
  usuarioId?: number;
  nombreUsuario?: string;
  // Campos de correo
  mailHost?: string;
  mailPort?: number;
  mailUsername?: string;
  mailPassword?: string;
  mailFrom?: string;
  mailStarttls?: boolean;
  mailHabilitado?: boolean;
}

export interface BackupRecord {
  recordId: number;
  nombreArchivo: string;
  tipo: string;
  origen: string;
  rutaServidor: string;
  driveFileId?: string;
  tamanoBytes: number;
  tamanoFormateado: string;
  estado: string;
  mensajeError?: string;
  creadoEn: string;
  finalizadoEn?: string;
  ejecutadoPor: string;
  usuarioId?: number;
  nombreUsuario?: string;
}

export interface BackupNotification {
  notificationId: number;
  recordId: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  creadoEn: string;
  usuarioId?: number;
  nombreUsuario?: string;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  private base = 'http://localhost:8080/api/backup';

  constructor(private http: HttpClient) {}

  // Config
  obtenerConfig(): Observable<BackupConfig> {
    return this.http.get<BackupConfig>(`${this.base}/config`);
  }

  guardarConfig(config: BackupConfig): Observable<BackupConfig> {
    return this.http.post<BackupConfig>(`${this.base}/config`, config);
  }

  // Ejecutar backup manual
  ejecutarBackup(tipo: string): Observable<BackupRecord> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.post<BackupRecord>(`${this.base}/ejecutar`, null, { params });
  }

  // Historial
  obtenerHistorial(): Observable<BackupRecord[]> {
    return this.http.get<BackupRecord[]>(`${this.base}/historial`);
  }

  obtenerHistorialPorTipo(tipo: string): Observable<BackupRecord[]> {
    return this.http.get<BackupRecord[]>(`${this.base}/historial/tipo/${tipo}`);
  }

  hayEnProceso(): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/en-proceso`);
  }

  descargarBackup(recordId: number): Observable<Blob> {
    return this.http.get(`${this.base}/descargar/${recordId}`, {
      responseType: 'blob'
    });
  }

  /** Marca un registro "En proceso" como fallido (para desbloquear). */
  marcarComoFallido(recordId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/historial/${recordId}/marcar-fallido`, null);
  }

  // Notificaciones
  obtenerNotificaciones(): Observable<BackupNotification[]> {
    return this.http.get<BackupNotification[]>(`${this.base}/notificaciones`);
  }

  obtenerNoLeidas(): Observable<BackupNotification[]> {
    return this.http.get<BackupNotification[]>(`${this.base}/notificaciones/no-leidas`);
  }

  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(`${this.base}/notificaciones/contador`);
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.put<void>(`${this.base}/notificaciones/marcar-leidas`, null);
  }

  probarCorreo(config: BackupConfig): Observable<void> {
    return this.http.post<void>(`${this.base}/config/probar-correo`, config);
  }

  // Restaurar (archivos locales)
  listarArchivosLocales(): Observable<BackupLocalFile[]> {
    return this.http.get<BackupLocalFile[]>(`${this.base}/restore/archivos-locales`);
  }

  ejecutarRestore(nombreArchivo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.base}/restore/ejecutar`, { nombreArchivo });
  }
}

export interface BackupLocalFile {
  nombreArchivo: string;
  tamanoBytes: number;
  tamanoFormateado: string;
  fechaModificacion: string;
}
