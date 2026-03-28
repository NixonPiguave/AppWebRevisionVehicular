import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, interval } from 'rxjs';
import { ChatInternoService, ChatInternoMensaje, ChatInternoSinLeerResumen } from '../../services/chat-interno.service';
import { UsuariosService, Usuario } from '../../services/administracion/usuarios.service';
import { AuthService } from '../../services/auth.service';

/** Con la conversación abierta, refresca mensajes (p. ej. leido_en / doble tilde) casi en tiempo real. */
const POLL_CONVERSACION_MS = 2000;
/** Cada cuántos ciclos del poll anterior se pide el resumen de no leídos (menos carga). */
const POLL_SIN_LEER_CADA_N_CICLOS = 5;

export interface ChatPeer {
  usuarioId: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
}

@Component({
  selector: 'app-chat-interno-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat-interno-panel.html',
  styleUrl: './chat-interno-panel.css'
})
export class ChatInternoPanelComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @ViewChild('mensajesScroll') private mensajesScroll?: ElementRef<HTMLDivElement>;

  vista: 'lista' | 'chat' = 'lista';
  busqueda = '';
  todosUsuarios: Usuario[] = [];
  peersFiltrados: ChatPeer[] = [];
  favoritosIds: number[] = [];
  favoritosPeers: ChatPeer[] = [];

  peerActivo: ChatPeer | null = null;
  mensajes: ChatInternoMensaje[] = [];
  textoEnviar = '';
  cargandoLista = false;
  cargandoMensajes = false;
  enviando = false;
  errorMsg = '';
  sinLeerResumen: ChatInternoSinLeerResumen = { totalSinLeer: 0, porEmisor: [] };

  private pollSub: Subscription | null = null;
  private sinLeerSub: Subscription | null = null;
  private scrollPending = false;
  private pollTick = 0;

  constructor(
    private chatApi: ChatInternoService,
    private usuariosApi: UsuariosService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFavoritosDesdeStorage();
    this.sinLeerSub = this.chatApi.sinLeer$.subscribe((r) => {
      this.sinLeerResumen = r;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        this.errorMsg = '';
        this.cargarFavoritosDesdeStorage();
        this.alAbrir();
        this.chatApi.refrescarSinLeer();
      } else {
        this.detenerPolling();
        this.vista = 'lista';
        this.peerActivo = null;
        this.mensajes = [];
      }
    }
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    this.sinLeerSub?.unsubscribe();
    this.sinLeerSub = null;
  }

  ngAfterViewChecked(): void {
    if (this.scrollPending && this.mensajesScroll) {
      const el = this.mensajesScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.scrollPending = false;
    }
  }

  cerrar(): void {
    this.visibleChange.emit(false);
  }

  alAbrir(): void {
    this.cargarUsuarios();
    this.refrescarFavoritosPeers();
  }

  private miId(): number | null {
    const raw = this.auth.getUsuarioId();
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private cargarFavoritosDesdeStorage(): void {
    const key = this.favoritosStorageKey();
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        this.favoritosIds = [];
        return;
      }
      const arr = JSON.parse(raw) as unknown;
      this.favoritosIds = Array.isArray(arr)
        ? arr.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n !== this.miId())
        : [];
    } catch {
      this.favoritosIds = [];
    }
  }

  private guardarFavoritos(): void {
    localStorage.setItem(this.favoritosStorageKey(), JSON.stringify(this.favoritosIds));
  }

  private favoritosStorageKey(): string {
    return `rtv_chat_favoritos_${this.auth.getUsuarioId() ?? 'anon'}`;
  }

  private cargarUsuarios(): void {
    this.cargandoLista = true;
    this.errorMsg = '';
    this.usuariosApi.listarUsuarios().subscribe({
      next: (list) => {
        const mid = this.miId();
        this.todosUsuarios = (list ?? []).filter((u) => u.usuarioId != null && u.usuarioId !== mid);
        this.aplicarFiltroBusqueda();
        this.refrescarFavoritosPeers();
        this.cargandoLista = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoLista = false;
        this.errorMsg = 'No se pudo cargar la lista de usuarios.';
        this.cdr.markForCheck();
      }
    });
  }

  private usuarioAPeer(u: Usuario): ChatPeer | null {
    if (!u.usuarioId) return null;
    return {
      usuarioId: u.usuarioId,
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      nombreCompleto: `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.usuario || `Usuario ${u.usuarioId}`
    };
  }

  onBusquedaInput(): void {
    this.aplicarFiltroBusqueda();
  }

  private aplicarFiltroBusqueda(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    const mid = this.miId();
    let base = this.todosUsuarios.filter((u) => u.usuarioId !== mid);
    if (q) {
      base = base.filter((u) => {
        const nom = `${u.nombre || ''} ${u.apellido || ''} ${u.usuario || ''}`.toLowerCase();
        return nom.includes(q);
      });
    }
    this.peersFiltrados = base
      .map((u) => this.usuarioAPeer(u))
      .filter((p): p is ChatPeer => p !== null)
      .slice(0, 50);
  }

  private refrescarFavoritosPeers(): void {
    const set = new Set(this.favoritosIds);
    this.favoritosPeers = this.todosUsuarios
      .filter((u) => u.usuarioId && set.has(u.usuarioId))
      .map((u) => this.usuarioAPeer(u))
      .filter((p): p is ChatPeer => p !== null);
  }

  esFavorito(usuarioId: number): boolean {
    return this.favoritosIds.includes(usuarioId);
  }

  toggleFavorito(peer: ChatPeer, ev?: Event): void {
    ev?.stopPropagation();
    const id = peer.usuarioId;
    if (id === this.miId()) return;
    const idx = this.favoritosIds.indexOf(id);
    if (idx >= 0) {
      this.favoritosIds.splice(idx, 1);
    } else {
      this.favoritosIds.push(id);
    }
    this.guardarFavoritos();
    this.refrescarFavoritosPeers();
  }

  abrirChat(peer: ChatPeer): void {
    if (peer.usuarioId === this.miId()) return;
    this.errorMsg = '';
    this.peerActivo = peer;
    this.vista = 'chat';
    this.textoEnviar = '';
    this.cargarMensajes(true);
    this.iniciarPolling();
  }

  volverLista(): void {
    this.vista = 'lista';
    this.peerActivo = null;
    this.mensajes = [];
    this.detenerPolling();
    this.chatApi.refrescarSinLeer();
  }

  /** Mensajes sin leer donde este usuario es el emisor (te escribió a ti). */
  cantidadSinLeerDe(emisorId: number): number {
    const it = this.sinLeerResumen.porEmisor.find((p) => Number(p.emisorId) === Number(emisorId));
    return it ? Number(it.cantidad) : 0;
  }

  /**
   * @param actualizarResumenSi true al abrir chat o enviar; false en polling silencioso (solo tildes).
   */
  private cargarMensajes(marcarScroll: boolean, actualizarResumenSinLeer = true): void {
    if (!this.peerActivo) return;
    if (marcarScroll) this.cargandoMensajes = true;
    const pid = this.peerActivo.usuarioId;
    this.chatApi.conversacion(pid).subscribe({
      next: (rows) => {
        this.mensajes = rows ?? [];
        this.cargandoMensajes = false;
        if (marcarScroll) this.scrollPending = true;
        if (actualizarResumenSinLeer) {
          this.chatApi.refrescarSinLeer();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.cargandoMensajes = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar la conversación.';
        this.cdr.markForCheck();
      }
    });
  }

  onComposerKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.enviar();
    }
  }

  enviar(): void {
    if (!this.peerActivo || this.enviando) return;
    const txt = (this.textoEnviar || '').trim();
    if (!txt) return;
    this.enviando = true;
    this.errorMsg = '';
    this.chatApi.enviar(this.peerActivo.usuarioId, txt).subscribe({
      next: () => {
        this.textoEnviar = '';
        this.enviando = false;
        this.errorMsg = '';
        this.cargarMensajes(true);
      },
      error: (err) => {
        this.enviando = false;
        this.errorMsg = err?.error?.message || err?.message || 'No se pudo enviar el mensaje.';
        this.cdr.markForCheck();
      }
    });
  }

  private iniciarPolling(): void {
    this.detenerPolling();
    this.pollTick = 0;
    this.pollSub = interval(POLL_CONVERSACION_MS).subscribe(() => {
      if (!this.visible || this.vista !== 'chat' || !this.peerActivo) {
        return;
      }
      this.pollTick++;
      this.cargarMensajes(false, false);
      if (this.pollTick % POLL_SIN_LEER_CADA_N_CICLOS === 0) {
        this.chatApi.refrescarSinLeer();
      }
    });
  }

  private detenerPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
    this.pollTick = 0;
  }

  formatoHora(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }
}
