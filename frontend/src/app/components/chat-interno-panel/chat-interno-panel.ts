import {
  Component,
  EventEmitter,
  HostListener,
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
import {
  ChatInternoService,
  ChatInternoMensaje,
  ChatInternoSinLeerResumen,
  EnviarChatOpciones
} from '../../services/chat-interno.service';
import { UsuariosService, Usuario } from '../../services/administracion/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { CloudinaryService } from '../../services/cloudinary.service';

const POLL_CONVERSACION_MS = 2000;
const POLL_SIN_LEER_CADA_N_CICLOS = 5;
const MAX_IMAGEN_MB = 8;

export interface ChatPeer {
  usuarioId: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
}

/** Imagen lista para revisar antes de subir (pegar o adjuntar). */
export interface BorradorImagenChat {
  file: File;
  previewUrl: string;
  leyenda: string;
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
  @ViewChild('inputFoto') private inputFoto?: ElementRef<HTMLInputElement>;

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
  subiendoFoto = false;
  errorMsg = '';
  sinLeerResumen: ChatInternoSinLeerResumen = { totalSinLeer: 0, porEmisor: [] };

  /** Responder citando un mensaje. */
  replyingTo: ChatInternoMensaje | null = null;

  /** Último mensajeId visto en el poll (para detectar mensajes nuevos y bajar el scroll). */
  private ultimoMensajeIdPoll: number | null = null;

  edicionMensajeId: number | null = null;
  textoEdicion = '';

  /** Botón flotante para volver al final del hilo cuando hay scroll hacia arriba. */
  mostrarFabIrAbajo = false;

  /** Vista previa antes de enviar imagen (Ctrl+V o botón adjuntar). */
  borradorImagen: BorradorImagenChat | null = null;

  /** Imagen del borrador a pantalla completa dentro del panel. */
  borradorPreviewAmpliado = false;

  private pollSub: Subscription | null = null;
  private sinLeerSub: Subscription | null = null;
  private scrollPending = false;
  /** Tras un poll sin mensaje nuevo: reponer distancia al fondo para no saltar arriba. */
  private scrollRestoreDistFromBottom: number | null = null;
  private pollTick = 0;

  /** Último contacto con el que se envió un mensaje (persistido; prioridad tras favoritos en «Todos»). */
  private ultimoPeerConversacionId: number | null = null;

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Escape' || !this.visible || !this.borradorPreviewAmpliado) {
      return;
    }
    this.cerrarBorradorPreviewAmpliado();
  }

  constructor(
    private chatApi: ChatInternoService,
    private usuariosApi: UsuariosService,
    private auth: AuthService,
    private cloudinary: CloudinaryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFavoritosDesdeStorage();
    this.sinLeerSub = this.chatApi.sinLeer$.subscribe((r) => {
      this.sinLeerResumen = r;
      this.aplicarFiltroBusqueda();
      this.refrescarFavoritosPeers();
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        this.errorMsg = '';
        this.cargarFavoritosDesdeStorage();
        this.cargarUltimoPeerConversacion();
        this.alAbrir();
        this.chatApi.refrescarSinLeer();
      } else {
        this.detenerPolling();
        this.vista = 'lista';
        this.peerActivo = null;
        this.mensajes = [];
        this.replyingTo = null;
        this.edicionMensajeId = null;
        this.mostrarFabIrAbajo = false;
        this.descartarBorradorImagen();
      }
    }
  }

  ngOnDestroy(): void {
    this.descartarBorradorImagen();
    this.detenerPolling();
    this.sinLeerSub?.unsubscribe();
    this.sinLeerSub = null;
  }

  ngAfterViewChecked(): void {
    if (this.scrollPending && this.mensajesScroll) {
      const el = this.mensajesScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.scrollPending = false;
      this.scrollRestoreDistFromBottom = null;
      this.mostrarFabIrAbajo = false;
    } else if (this.scrollRestoreDistFromBottom != null && this.mensajesScroll) {
      const el = this.mensajesScroll.nativeElement;
      const d = this.scrollRestoreDistFromBottom;
      this.scrollRestoreDistFromBottom = null;
      const target = el.scrollHeight - el.clientHeight - d;
      el.scrollTop = Math.max(0, target);
      this.actualizarVisibilidadFabScroll();
    }
  }

  trackByMensajeId(_index: number, m: ChatInternoMensaje): number {
    return m.mensajeId;
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

  private ultimoPeerStorageKey(): string {
    return `rtv_chat_ultimo_peer_${this.auth.getUsuarioId() ?? 'anon'}`;
  }

  private cargarUltimoPeerConversacion(): void {
    try {
      const raw = localStorage.getItem(this.ultimoPeerStorageKey());
      const n = raw != null ? Number(raw) : NaN;
      this.ultimoPeerConversacionId = Number.isFinite(n) ? n : null;
    } catch {
      this.ultimoPeerConversacionId = null;
    }
  }

  /** Guarda último destinatario/emisor activo tras enviar mensaje; reordena listas. */
  private recordUltimoPeerConversacion(peerId: number): void {
    if (!Number.isFinite(peerId)) {
      return;
    }
    this.ultimoPeerConversacionId = peerId;
    try {
      localStorage.setItem(this.ultimoPeerStorageKey(), String(peerId));
    } catch {
      /* ignore */
    }
    this.refrescarFavoritosPeers();
    this.aplicarFiltroBusqueda();
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

  /** Favoritos: sin no leídos primero; entre iguales, el último chat arriba; luego nombre. */
  private ordenarFavoritosPeers(peers: ChatPeer[]): ChatPeer[] {
    const ult = this.ultimoPeerConversacionId;
    return [...peers].sort((a, b) => {
      const ua = this.cantidadSinLeerDe(a.usuarioId);
      const ub = this.cantidadSinLeerDe(b.usuarioId);
      if (ua > 0 && ub === 0) return -1;
      if (ub > 0 && ua === 0) return 1;
      if (ua !== ub) return ub - ua;
      const la = a.usuarioId === ult ? 1 : 0;
      const lb = b.usuarioId === ult ? 1 : 0;
      if (la !== lb) return lb - la;
      return a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' });
    });
  }

  /**
   * Lista "Todos": si hay favoritos, no se repiten aquí (ya van arriba).
   * Orden: último chat con quien hablaste, luego no leídos, luego nombre.
   */
  private ordenarTodosPeers(peers: ChatPeer[]): ChatPeer[] {
    const ult = this.ultimoPeerConversacionId;
    return [...peers].sort((a, b) => {
      const la = a.usuarioId === ult ? 1 : 0;
      const lb = b.usuarioId === ult ? 1 : 0;
      if (la !== lb) return lb - la;
      const ua = this.cantidadSinLeerDe(a.usuarioId);
      const ub = this.cantidadSinLeerDe(b.usuarioId);
      if (ua > 0 && ub === 0) return -1;
      if (ub > 0 && ua === 0) return 1;
      if (ua !== ub) return ub - ua;
      return a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' });
    });
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
    const peers = base
      .map((u) => this.usuarioAPeer(u))
      .filter((p): p is ChatPeer => p !== null);
    let forTodos = peers;
    if (this.favoritosIds.length > 0) {
      forTodos = peers.filter((p) => !this.esFavorito(p.usuarioId));
    }
    this.peersFiltrados = this.ordenarTodosPeers(forTodos).slice(0, 50);
  }

  private refrescarFavoritosPeers(): void {
    const set = new Set(this.favoritosIds);
    const raw = this.todosUsuarios
      .filter((u) => u.usuarioId && set.has(u.usuarioId))
      .map((u) => this.usuarioAPeer(u))
      .filter((p): p is ChatPeer => p !== null);
    this.favoritosPeers = this.ordenarFavoritosPeers(raw);
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
    this.aplicarFiltroBusqueda();
  }

  abrirChat(peer: ChatPeer): void {
    if (peer.usuarioId === this.miId()) return;
    this.errorMsg = '';
    this.peerActivo = peer;
    this.vista = 'chat';
    this.textoEnviar = '';
    this.replyingTo = null;
    this.edicionMensajeId = null;
    this.ultimoMensajeIdPoll = null;
    this.mostrarFabIrAbajo = false;
    this.scrollRestoreDistFromBottom = null;
    this.descartarBorradorImagen();
    this.cargarMensajes(true);
    this.iniciarPolling();
  }

  volverLista(): void {
    this.vista = 'lista';
    this.peerActivo = null;
    this.mensajes = [];
    this.replyingTo = null;
    this.edicionMensajeId = null;
    this.mostrarFabIrAbajo = false;
    this.scrollRestoreDistFromBottom = null;
    this.descartarBorradorImagen();
    this.detenerPolling();
    this.chatApi.refrescarSinLeer();
    this.refrescarFavoritosPeers();
    this.aplicarFiltroBusqueda();
  }

  cantidadSinLeerDe(emisorId: number): number {
    const it = this.sinLeerResumen.porEmisor.find((p) => Number(p.emisorId) === Number(emisorId));
    return it ? Number(it.cantidad) : 0;
  }

  private cargarMensajes(marcarScrollInicial: boolean, actualizarResumenSinLeer = true): void {
    if (!this.peerActivo) return;
    if (marcarScrollInicial) this.cargandoMensajes = true;
    const pid = this.peerActivo.usuarioId;
    const prevUltimo = this.ultimoMensajeIdPoll;

    const el = this.mensajesScroll?.nativeElement;
    let distDesdeFondo: number | null = null;
    if (
      el &&
      !marcarScrollInicial &&
      this.edicionMensajeId == null &&
      prevUltimo != null
    ) {
      distDesdeFondo = el.scrollHeight - el.scrollTop - el.clientHeight;
    }

    this.chatApi.conversacion(pid).subscribe({
      next: (rows) => {
        this.mensajes = rows ?? [];
        const last = this.mensajes.length ? this.mensajes[this.mensajes.length - 1].mensajeId : null;
        const hayNuevo =
          !marcarScrollInicial && prevUltimo != null && last != null && last !== prevUltimo;
        this.ultimoMensajeIdPoll = last;
        this.cargandoMensajes = false;

        this.scrollRestoreDistFromBottom = null;
        if (marcarScrollInicial || hayNuevo) {
          this.scrollPending = true;
        } else if (
          distDesdeFondo != null &&
          this.edicionMensajeId == null &&
          distDesdeFondo >= 0
        ) {
          this.scrollRestoreDistFromBottom = distDesdeFondo;
        }

        if (actualizarResumenSinLeer) {
          this.chatApi.refrescarSinLeer();
        }
        setTimeout(() => this.actualizarVisibilidadFabScroll(), 0);
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

  esImagen(m: ChatInternoMensaje): boolean {
    return (m.tipo || 'TEXTO').toUpperCase() === 'IMAGEN';
  }

  mostrarEtiquetaEmisor(i: number): boolean {
    const m = this.mensajes[i];
    if (!m || m.enviadoPorMi) return false;
    return i === 0 || this.mensajes[i - 1].enviadoPorMi;
  }

  iniciarRespuesta(m: ChatInternoMensaje, ev?: Event): void {
    ev?.stopPropagation();
    this.replyingTo = m;
    this.edicionMensajeId = null;
  }

  textoVistaMensaje(m: ChatInternoMensaje | null): string {
    if (!m) {
      return '';
    }
    if (this.esImagen(m)) {
      const leg = (m.leyenda || '').trim();
      return leg || '[Foto]';
    }
    return m.contenido || '';
  }

  cancelarRespuesta(): void {
    this.replyingTo = null;
  }

  iniciarEdicion(m: ChatInternoMensaje, ev?: Event): void {
    ev?.stopPropagation();
    if (!m.enviadoPorMi || this.esImagen(m)) return;
    this.descartarBorradorImagen();
    this.replyingTo = null;
    this.edicionMensajeId = m.mensajeId;
    this.textoEdicion = m.contenido;
  }

  cancelarEdicion(): void {
    this.edicionMensajeId = null;
    this.textoEdicion = '';
  }

  guardarEdicion(): void {
    if (this.edicionMensajeId == null) return;
    const txt = (this.textoEdicion || '').trim();
    if (!txt) return;
    this.enviando = true;
    this.chatApi.editarMensaje(this.edicionMensajeId, txt).subscribe({
      next: () => {
        this.enviando = false;
        this.cancelarEdicion();
        this.cargarMensajes(false);
      },
      error: (err) => {
        this.enviando = false;
        this.errorMsg = err?.error?.message || 'No se pudo editar el mensaje.';
        this.cdr.markForCheck();
      }
    });
  }

  abrirSelectorFoto(): void {
    this.inputFoto?.nativeElement?.click();
  }

  onFotoSeleccionada(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    this.colocarImagenEnBorrador(file);
  }

  /**
   * Pega imagen desde el portapapeles (Ctrl+V): abre borrador con vista previa (no envía al instante).
   * Si no hay imagen, el pegado de texto sigue funcionando con normalidad.
   */
  onComposerPaste(ev: ClipboardEvent): void {
    if (!this.peerActivo || this.subiendoFoto || this.enviando) {
      return;
    }
    const cd = ev.clipboardData;
    if (!cd) {
      return;
    }
    let archivo: File | null = null;
    if (cd.files?.length) {
      for (let i = 0; i < cd.files.length; i++) {
        const f = cd.files.item(i);
        if (f?.type.startsWith('image/')) {
          archivo = f;
          break;
        }
      }
    }
    if (!archivo && cd.items?.length) {
      for (let i = 0; i < cd.items.length; i++) {
        const it = cd.items[i];
        if (it.kind === 'file' && it.type.startsWith('image/')) {
          archivo = it.getAsFile();
          if (archivo) {
            break;
          }
        }
      }
    }
    if (!archivo) {
      return;
    }
    ev.preventDefault();
    this.colocarImagenEnBorrador(archivo);
  }

  colocarImagenEnBorrador(file: File | null): void {
    if (!file || !this.peerActivo || this.subiendoFoto) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Elija un archivo de imagen.';
      return;
    }
    if (file.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.errorMsg = `La imagen no debe superar ${MAX_IMAGEN_MB} MB.`;
      return;
    }
    this.errorMsg = '';
    this.descartarBorradorImagen();
    this.borradorImagen = {
      file,
      previewUrl: URL.createObjectURL(file),
      leyenda: ''
    };
    this.cdr.markForCheck();
  }

  descartarBorradorImagen(): void {
    this.borradorPreviewAmpliado = false;
    if (this.borradorImagen?.previewUrl) {
      URL.revokeObjectURL(this.borradorImagen.previewUrl);
    }
    this.borradorImagen = null;
    this.cdr.markForCheck();
  }

  abrirBorradorPreviewAmpliado(): void {
    if (!this.borradorImagen) {
      return;
    }
    this.borradorPreviewAmpliado = true;
    this.cdr.markForCheck();
  }

  cerrarBorradorPreviewAmpliado(): void {
    this.borradorPreviewAmpliado = false;
    this.cdr.markForCheck();
  }

  confirmarEnvioBorradorImagen(): void {
    if (!this.peerActivo || !this.borradorImagen || this.subiendoFoto) {
      return;
    }
    const { file, leyenda } = this.borradorImagen;
    this.errorMsg = '';
    this.subiendoFoto = true;
    const opts: EnviarChatOpciones = { tipo: 'IMAGEN' };
    if (this.replyingTo) {
      opts.respuestaAMensajeId = this.replyingTo.mensajeId;
    }
    const leg = (leyenda || '').trim();
    if (leg) {
      opts.leyenda = leg;
    }
    this.cloudinary.uploadImage(file, 'chat-interno').subscribe({
      next: (res) => {
        const url = res?.url;
        if (!url) {
          this.subiendoFoto = false;
          this.errorMsg = 'No se obtuvo URL de la imagen.';
          this.cdr.markForCheck();
          return;
        }
        this.chatApi.enviar(this.peerActivo!.usuarioId, url, opts).subscribe({
          next: () => {
            this.subiendoFoto = false;
            this.descartarBorradorImagen();
            this.replyingTo = null;
            this.recordUltimoPeerConversacion(this.peerActivo!.usuarioId);
            this.cargarMensajes(true);
          },
          error: (err) => {
            this.subiendoFoto = false;
            this.errorMsg = err?.error?.message || 'No se pudo enviar la foto.';
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.subiendoFoto = false;
        this.errorMsg = err?.error?.error || err?.message || 'Error al subir la imagen.';
        this.cdr.markForCheck();
      }
    });
  }

  enviar(): void {
    if (!this.peerActivo || this.enviando) return;
    const txt = (this.textoEnviar || '').trim();
    if (!txt) return;
    this.enviando = true;
    this.errorMsg = '';
    const opts: EnviarChatOpciones = {};
    if (this.replyingTo) {
      opts.respuestaAMensajeId = this.replyingTo.mensajeId;
    }
    this.chatApi.enviar(this.peerActivo.usuarioId, txt, opts).subscribe({
      next: () => {
        this.textoEnviar = '';
        this.replyingTo = null;
        this.enviando = false;
        this.errorMsg = '';
        this.recordUltimoPeerConversacion(this.peerActivo!.usuarioId);
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
      if (this.edicionMensajeId != null || this.borradorImagen != null) {
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

  onMensajesScroll(): void {
    this.actualizarVisibilidadFabScroll();
  }

  irAlUltimoMensaje(): void {
    const el = this.mensajesScroll?.nativeElement;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    this.mostrarFabIrAbajo = false;
    this.cdr.markForCheck();
  }

  private actualizarVisibilidadFabScroll(): void {
    const el = this.mensajesScroll?.nativeElement;
    if (!el || this.vista !== 'chat') {
      this.mostrarFabIrAbajo = false;
      return;
    }
    const umbral = 100;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanciaAlFinal = scrollHeight - scrollTop - clientHeight;
    const hayOverflow = scrollHeight > clientHeight + 4;
    const cercaDelFinal = distanciaAlFinal <= umbral;
    const siguiente = hayOverflow && !cercaDelFinal;
    if (siguiente !== this.mostrarFabIrAbajo) {
      this.mostrarFabIrAbajo = siguiente;
      this.cdr.markForCheck();
    }
  }
}
