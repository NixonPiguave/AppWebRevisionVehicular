import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';

export interface ChatInternoMensaje {
  mensajeId: number;
  emisorId: number;
  receptorId: number;
  contenido: string;
  creadoEn: string;
  /** Si no es null, el destinatario ya abrió/vió el mensaje. */
  leidoEn?: string | null;
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

@Injectable({ providedIn: 'root' })
export class ChatInternoService {
  private readonly apiUrl = 'http://localhost:8080/api/chat-interno';

  private readonly sinLeerSubject = new BehaviorSubject<ChatInternoSinLeerResumen>({
    totalSinLeer: 0,
    porEmisor: []
  });

  /** Resumen para badge en header y lista de contactos. */
  readonly sinLeer$ = this.sinLeerSubject.asObservable();

  constructor(private http: HttpClient) {}

  conversacion(otroUsuarioId: number): Observable<ChatInternoMensaje[]> {
    return this.http.get<ChatInternoMensaje[]>(`${this.apiUrl}/conversacion/${otroUsuarioId}`);
  }

  enviar(receptorId: number, contenido: string): Observable<ChatInternoMensaje> {
    return this.http.post<ChatInternoMensaje>(`${this.apiUrl}/enviar`, { receptorId, contenido });
  }

  /** Actualiza conteos de no leídos (llamar tras abrir conversación o por intervalo). */
  refrescarSinLeer(): void {
    this.http
      .get<ChatInternoSinLeerResumen>(`${this.apiUrl}/sin-leer`)
      .pipe(
        catchError(() =>
          of<ChatInternoSinLeerResumen>({ totalSinLeer: 0, porEmisor: [] })
        ),
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
