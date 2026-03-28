import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';

export interface ChatInternoMensaje {
  mensajeId: number;
  emisorId: number;
  receptorId: number;
  contenido: string;
  tipo: string;
  /** Pie de foto (solo mensajes IMAGEN). */
  leyenda?: string | null;
  creadoEn: string;
  leidoEn?: string | null;
  editadoEn?: string | null;
  respuestaAMensajeId?: number | null;
  respuestaVistaPrevia?: string | null;
  respuestaTipo?: string | null;
  enviadoPorMi: boolean;
}

export interface ChatInternoSinLeerItem {
  emisorId: number;
  cantidad: number;
}

export interface ChatInternoSinLeerResumen {
  totalSinLeer: number;
  porEmisor: ChatInternoSinLeerItem[];
}

export interface EnviarChatOpciones {
  respuestaAMensajeId?: number | null;
  tipo?: 'TEXTO' | 'IMAGEN';
  leyenda?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChatInternoService {
  private readonly apiUrl = 'http://localhost:8080/api/chat-interno';

  private readonly sinLeerSubject = new BehaviorSubject<ChatInternoSinLeerResumen>({
    totalSinLeer: 0,
    porEmisor: []
  });

  readonly sinLeer$ = this.sinLeerSubject.asObservable();

  constructor(private http: HttpClient) {}

  conversacion(otroUsuarioId: number): Observable<ChatInternoMensaje[]> {
    return this.http.get<ChatInternoMensaje[]>(`${this.apiUrl}/conversacion/${otroUsuarioId}`);
  }

  enviar(
    receptorId: number,
    contenido: string,
    opciones?: EnviarChatOpciones
  ): Observable<ChatInternoMensaje> {
    const body: Record<string, unknown> = { receptorId, contenido, tipo: opciones?.tipo ?? 'TEXTO' };
    if (opciones?.respuestaAMensajeId != null) {
      body['respuestaAMensajeId'] = opciones.respuestaAMensajeId;
    }
    const leg = opciones?.leyenda?.trim();
    if (leg) {
      body['leyenda'] = leg;
    }
    return this.http.post<ChatInternoMensaje>(`${this.apiUrl}/enviar`, body);
  }

  editarMensaje(mensajeId: number, contenido: string): Observable<ChatInternoMensaje> {
    return this.http.put<ChatInternoMensaje>(`${this.apiUrl}/mensaje/${mensajeId}`, { contenido });
  }

  refrescarSinLeer(): void {
    this.http
      .get<ChatInternoSinLeerResumen>(`${this.apiUrl}/sin-leer`)
      .pipe(
        catchError(() => of<ChatInternoSinLeerResumen>({ totalSinLeer: 0, porEmisor: [] })),
        tap((r) =>
          this.sinLeerSubject.next({
            totalSinLeer: r?.totalSinLeer ?? 0,
            porEmisor: Array.isArray(r?.porEmisor) ? r.porEmisor : []
          })
        )
      )
      .subscribe();
  }
}
