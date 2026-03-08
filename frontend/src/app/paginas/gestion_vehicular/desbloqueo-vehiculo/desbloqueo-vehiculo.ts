import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DesbloqueoVehiculoService, DesbloqueoVehiculo } from '../../../services/rtv/DesbloqueoVehiculo.service';
import { BloqueoVehiculoService, BloqueoVehiculo } from '../../../services/rtv/BloqueoVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { UsuariosService } from '../../../services/administracion/usuarios.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { TurnoRecepcionService, TurnoPagado } from '../../../services/administracion/turno-recepcion.service';
import { ServicioService } from '../../../services/administracion/servicio.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface TurnoParaSelector extends TurnoPagado {
  vehiculoDescripcion?: string;
  propietarioNombre?: string;
}

const DESBLOQUEO_VACIO: DesbloqueoVehiculo = {
  idDesbloqueo: null,
  tramiteId: null,
  bloqueoId: null,
  vehiculoId: null,
  entidadId: null,
  usuarioDesactivaId: null,
  numeroTramite: '',
  documentoLevantamiento: '',
  motivoLevantamiento: '',
  fechaDesactivacion: '',
  estado: 'CONCLUIDO'
};

@Component({
  selector: 'app-desbloqueo-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './desbloqueo-vehiculo.html',
  styleUrl: './desbloqueo-vehiculo.css'
})
export class DesbloqueoVehiculoComponent implements OnInit {

  registros: DesbloqueoVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: DesbloqueoVehiculo = { ...DESBLOQUEO_VACIO };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: DesbloqueoVehiculo | null = null;
  cargandoDetalle = false;
  detalleVehiculo: Vehiculo | null = null;
  detallePropietario: { nombre: string; documentoIdentidad: string } | null = null;
  detalleBloqueoRef = '';
  detalleEntidadNombre = '';
  detalleUsuarioNombre = '';
  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];

  estadosOpciones = ['CONCLUIDO', 'ANULADO'];

  // Selector Bloqueo
  mostrarModalBloqueo = false;
  cargandoBloqueos = false;
  bloqueosEncontrados: BloqueoVehiculo[] = [];
  busquedaBloqueo = '';
  bloqueoSeleccionadoInfo: BloqueoVehiculo | null = null;

  // Selector Vehículo
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  // Documento levantamiento (archivo)
  documentoLevantamientoFile: File | null = null;
  documentoLevantamientoUrl = '';
  uploadingDocumento = false;

  fromRecepcion = false;
  turnoId: number | null = null;
  numeroTurno = '';
  turnoSeleccionadoInfo: TurnoParaSelector | null = null;
  mostrarModalTurno = false;
  cargandoTurnos = false;
  turnosDisponibles: TurnoParaSelector[] = [];
  /** ID del servicio "Desbloqueo" para filtrar turnos a procesar. */
  servicioIdParaTurno: number | null = null;

  constructor(
    private service: DesbloqueoVehiculoService,
    private bloqueoService: BloqueoVehiculoService,
    private vehiculoService: VehiculoService,
    private propietarioService: PropietarioService,
    private entidadesTransitoService: EntidadesTransitoService,
    private usuariosService: UsuariosService,
    private empresaService: EmpresaService,
    private cloudinaryService: CloudinaryService,
    private authService: AuthService,
    private turnoRecepcionService: TurnoRecepcionService,
    private servicioService: ServicioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.entidadesTransitoService.listar().subscribe({
      next: (data) => {
        this.entidadesTransito = (data ?? []).map(e => ({ idEntidad: e.idEntidad, codigo: e.codigo, nombre: e.nombre }));
        this.cdr.detectChanges();
      }
    });
    this.servicioService.listar().subscribe({
      next: (list) => {
        const s = (list ?? []).find(x => x.nombre?.toLowerCase().includes('desbloqueo'));
        this.servicioIdParaTurno = s?.idTipoTramite ?? null;
        this.cdr.detectChanges();
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['fromRecepcion'] === 'true') {
        this.fromRecepcion = true;
        this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
        this.numeroTurno = params['numeroTurno'] ?? `TRN-${this.turnoId}`;
      }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar los desbloqueos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): DesbloqueoVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivoLevantamiento?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idDesbloqueo?.toString() || '').includes(f)
    );
  }

  get paginados(): DesbloqueoVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...DESBLOQUEO_VACIO };
    const uid = this.authService.getUsuarioId();
    this.editando.usuarioDesactivaId = uid ? +uid : null;
    this.bloqueoSeleccionadoInfo = null;
    this.vehiculoSeleccionadoInfo = null;
    this.documentoLevantamientoUrl = this.editando.documentoLevantamiento || '';
    this.documentoLevantamientoFile = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: DesbloqueoVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.documentoLevantamientoUrl = r.documentoLevantamiento || '';
    this.documentoLevantamientoFile = null;
    if (this.editando.bloqueoId) this.cargarBloqueoPorId(this.editando.bloqueoId);
    else this.bloqueoSeleccionadoInfo = null;
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.documentoLevantamientoUrl = '';
    this.documentoLevantamientoFile = null;
  }

  guardar(): void {
    if (!this.editando.bloqueoId || !this.editando.vehiculoId || !this.editando.motivoLevantamiento?.trim()) {
      this.notification.error('Debe seleccionar bloqueo, vehículo y especificar el motivo.');
      return;
    }
    if (this.editando.entidadId == null) {
      this.notification.error('Debe seleccionar la entidad de tránsito.');
      return;
    }
    if (!this.documentoLevantamientoUrl && !this.documentoLevantamientoFile) {
      this.notification.error('Debe adjuntar el documento de levantamiento.');
      return;
    }
    if (this.editando.usuarioDesactivaId == null) {
      const uid = this.authService.getUsuarioId();
      if (uid) this.editando.usuarioDesactivaId = +uid;
    }
    if (this.editando.usuarioDesactivaId == null) {
      this.notification.error('No se pudo identificar al usuario en sesión. Vuelva a iniciar sesión.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idDesbloqueo;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    if (!this.modoEdicion && !this.editando.numeroTramite) {
      this.editando.numeroTramite = 'DSB-' + Date.now();
    }
    const guardarConDocumento = () => {
      if (this.documentoLevantamientoFile) {
        const isPdf = this.documentoLevantamientoFile.type === 'application/pdf';
        const upload$ = isPdf
          ? this.cloudinaryService.uploadPdf(this.documentoLevantamientoFile, 'documentos')
          : this.cloudinaryService.uploadImage(this.documentoLevantamientoFile, 'documentos');
        upload$.subscribe({
          next: (res) => {
            this.editando.documentoLevantamiento = res.url;
            this.ejecutarGuardado(op);
          },
          error: () => { this.guardando = false; this.notification.error('Error al subir el documento.'); }
        });
      } else {
        this.editando.documentoLevantamiento = this.documentoLevantamientoUrl;
        this.ejecutarGuardado(op);
      }
    };
    guardarConDocumento();
  }

  private ejecutarGuardado(op: ReturnType<DesbloqueoVehiculoService['crear']> | ReturnType<DesbloqueoVehiculoService['actualizar']>): void {
    op.subscribe({
      next: () => {
        if (this.turnoId) {
          const eraFromRecepcion = this.fromRecepcion;
          this.turnoRecepcionService.finalizarTurno(this.turnoId).subscribe({
            next: () => {
              this.notification.success('Desbloqueo registrado y turno finalizado. No aparecerá en Recepción.');
              this.limpiarTurno();
              this.fromRecepcion = false;
              this.cargar();
              this.cerrarModalForm();
              this.guardando = false;
              if (eraFromRecepcion) this.router.navigate(['/inicio/administracion/recepcion']);
            },
            error: () => {
              this.cargar();
              this.cerrarModalForm();
              this.guardando = false;
              this.notification.warn('Desbloqueo guardado. No se pudo marcar el turno como finalizado.');
            }
          });
        } else {
          this.cargar();
          this.cerrarModalForm();
          this.guardando = false;
        }
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar el desbloqueo.'); }
    });
  }

  abrirSelectorTurno(): void {
    this.mostrarModalTurno = true;
    this.cargarTurnosDisponibles();
  }

  cerrarSelectorTurno(): void { this.mostrarModalTurno = false; }

  cargarTurnosDisponibles(): void {
    this.cargandoTurnos = true;
    this.turnoRecepcionService.listarPagados(this.servicioIdParaTurno ?? undefined).pipe(catchError(() => of([]))).subscribe(raw => {
      const activos = (raw || []).filter((t: TurnoPagado) =>
        (t.estado || '').toUpperCase() !== 'FINALIZADO' && (t.estado || '').toUpperCase() !== 'GENERADO'
      );
      if (activos.length === 0) {
        this.turnosDisponibles = [];
        this.cargandoTurnos = false;
        this.cdr.detectChanges();
        return;
      }
      const propietarioIds = [...new Set(activos.map((t: TurnoPagado) => t.propietarioId))];
      const vehiculoIds = [...new Set(activos.map((t: TurnoPagado) => t.vehiculoId))];
      const propietarios$ = forkJoin(propietarioIds.map(id =>
        this.propietarioService.obtenerPorId(id).pipe(catchError(() => of({ idPropietario: id, nombre: '#' + id })))
      ));
      const vehiculos$ = forkJoin(vehiculoIds.map(id =>
        this.vehiculoService.obtenerPorId(id).pipe(catchError(() => of({ id: id, matricula: '#' + id })))
      ));
      forkJoin({ propietarios: propietarios$, vehiculos: vehiculos$ }).subscribe({
        next: ({ propietarios, vehiculos }) => {
          const propMap = new Map<number, any>();
          propietarios.forEach((p: any) => propMap.set(p.idPropietario ?? p.id ?? p.propietarioId, p));
          const vehMap = new Map<number, any>();
          vehiculos.forEach((v: any) => vehMap.set(v.id ?? v.vehiculoId ?? v.idVehiculo, v));
          this.turnosDisponibles = activos.map((t: TurnoPagado) => {
            const prop = propMap.get(t.propietarioId);
            const veh = vehMap.get(t.vehiculoId);
            const propNombre = prop ? (prop.nombre ?? '#' + t.propietarioId) : '#' + t.propietarioId;
            const vehDesc = veh ? (veh.matricula || veh.placa || '') + (veh.chasis ? ' - ' + veh.chasis : '') || '#' + t.vehiculoId : '#' + t.vehiculoId;
            return { ...t, propietarioNombre: propNombre, vehiculoDescripcion: vehDesc };
          });
          this.cargandoTurnos = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.turnosDisponibles = activos.map((t: TurnoPagado) => ({ ...t, propietarioNombre: '#' + t.propietarioId, vehiculoDescripcion: '#' + t.vehiculoId }));
          this.cargandoTurnos = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  seleccionarTurno(t: TurnoParaSelector): void {
    this.turnoSeleccionadoInfo = t;
    this.turnoId = t.turnoId;
    this.numeroTurno = 'TRN-' + t.turnoId;
    if (t.vehiculoId) {
      this.editando.vehiculoId = t.vehiculoId;
      this.cargarVehiculoPorId(t.vehiculoId);
    }
    this.cerrarSelectorTurno();
  }

  limpiarTurno(): void {
    this.turnoSeleccionadoInfo = null;
    this.turnoId = null;
    this.numeroTurno = '';
  }

  // ===== Selector Bloqueo =====
  abrirSelectorBloqueo(): void {
    this.mostrarModalBloqueo = true;
    this.buscarBloqueos();
  }

  cerrarSelectorBloqueo(): void { this.mostrarModalBloqueo = false; }

  buscarBloqueos(): void {
    this.cargandoBloqueos = true;
    this.bloqueoService.listar().subscribe({
      next: (data) => {
        const f = this.busquedaBloqueo.toLowerCase();
        this.bloqueosEncontrados = (data ?? []).filter(b =>
          !f || (b.numeroTramite?.toLowerCase().includes(f) || b.institucionOrigen?.toLowerCase().includes(f) || b.motivo?.toLowerCase().includes(f))
        );
        this.cargandoBloqueos = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoBloqueos = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarBloqueo(b: BloqueoVehiculo): void {
    this.bloqueoSeleccionadoInfo = b;
    this.editando.bloqueoId = b.idBloqueoSrv ?? null;
    if (b.entidadId != null) {
      this.editando.entidadId = b.entidadId;
    }
    const vid = b.vehiculoId ?? (b as any).vehiculo_id;
    if (vid != null) {
      this.editando.vehiculoId = typeof vid === 'number' ? vid : +vid;
      this.cargarVehiculoPorId(this.editando.vehiculoId);
    }
    this.cerrarSelectorBloqueo();
  }

  limpiarBloqueo(): void {
    this.bloqueoSeleccionadoInfo = null;
    this.editando.bloqueoId = null;
  }

  private cargarBloqueoPorId(id: number): void {
    if (!id || id <= 0) return;
    this.bloqueoService.listar().subscribe({
      next: (data) => {
        const b = (data ?? []).find(x => x.idBloqueoSrv === id);
        if (b) this.bloqueoSeleccionadoInfo = b;
      }
    });
  }

  // ===== Selector Vehículo =====
  abrirSelectorVehiculo(): void {
    this.mostrarModalVehiculo = true;
    this.busquedaPlaca = this.vehiculoSeleccionadoInfo?.matricula ?? this.busquedaPlaca;
    this.buscarVehiculos();
  }

  cerrarSelectorVehiculo(): void { this.mostrarModalVehiculo = false; }

  buscarVehiculos(): void {
    this.cargandoVehiculos = true;
    this.vehiculoService.buscarPorPlaca(this.busquedaPlaca).subscribe({
      next: (data) => {
        this.vehiculosEncontrados = data ?? [];
        this.cargandoVehiculos = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoVehiculos = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    this.vehiculoSeleccionadoInfo = v;
    this.editando.vehiculoId = (v.id ?? 0) as number;
    this.cerrarSelectorVehiculo();
  }

  limpiarVehiculo(): void {
    this.vehiculoSeleccionadoInfo = null;
    this.editando.vehiculoId = null;
  }

  private cargarVehiculoPorId(id: number): void {
    if (!id || id <= 0) return;
    this.vehiculoService.obtenerPorId(id).subscribe({
      next: (v) => (this.vehiculoSeleccionadoInfo = v),
      error: () => console.warn('No se pudo cargar vehículo por ID')
    });
  }

  // ===== Documento levantamiento (archivo) =====
  onDocumentoLevantamientoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPdf && !isImage) {
        this.notification.error('Solo se permiten PDF o imágenes (JPG, PNG, etc.)');
        input.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notification.error(`El archivo no debe superar 5MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        input.value = '';
        return;
      }
      this.documentoLevantamientoFile = file;
      this.documentoLevantamientoUrl = '';
      this.cdr.detectChanges();
    }
  }

  removerDocumentoLevantamiento(): void {
    this.documentoLevantamientoFile = null;
    this.documentoLevantamientoUrl = '';
    if (this.modoEdicion) this.editando.documentoLevantamiento = '';
    this.cdr.detectChanges();
  }

  verDetalle(r: DesbloqueoVehiculo): void {
    this.detalle = r;
    this.detalleVehiculo = null;
    this.detallePropietario = null;
    this.detalleBloqueoRef = '';
    this.detalleEntidadNombre = '';
    this.detalleUsuarioNombre = '';
    this.mostrarModalDetalle = true;
    this.cargandoDetalle = true;
    this.cdr.detectChanges();

    const entidad = r.entidadId != null ? this.entidadesTransito.find(e => e.idEntidad === r.entidadId) : null;
    this.detalleEntidadNombre = entidad ? `${entidad.codigo} - ${entidad.nombre}` : (r.entidadId?.toString() ?? '');

    this.bloqueoService.listar().pipe(catchError(() => of([]))).subscribe(lista => {
      const b = lista.find(x => x.idBloqueoSrv === r.bloqueoId);
      this.detalleBloqueoRef = b ? `#${b.idBloqueoSrv} - ${b.numeroTramite}` : (r.bloqueoId != null ? `#${r.bloqueoId}` : '');
      this.cdr.detectChanges();
    });

    if (r.vehiculoId) {
      this.vehiculoService.obtenerPorId(r.vehiculoId).pipe(catchError(() => of(null))).subscribe(v => {
        this.detalleVehiculo = v ?? null;
        if (v?.propietarioId) {
          this.propietarioService.obtenerPorId(v.propietarioId).pipe(catchError(() => of(null))).subscribe(p => {
            this.detallePropietario = p ? { nombre: p.nombre, documentoIdentidad: p.documentoIdentidad } : null;
            this.cargandoDetalle = false;
            this.cdr.detectChanges();
          });
        } else {
          this.cargandoDetalle = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cargandoDetalle = false;
      this.cdr.detectChanges();
    }
    if (r.usuarioDesactivaId) {
      this.usuariosService.obtenerUsuario(r.usuarioDesactivaId).pipe(catchError(() => of(null))).subscribe(u => {
        this.detalleUsuarioNombre = u ? `${u.nombre} ${u.apellido}`.trim() : (r.usuarioDesactivaId?.toString() ?? '');
        this.cdr.detectChanges();
      });
    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.detalle = null;
    this.detalleVehiculo = null;
    this.detallePropietario = null;
  }

  descargarDocumento(url: string, nombreBase: string): void {
    if (!url) return;
    fetch(url, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el archivo');
        const contentType = res.headers.get('Content-Type') || '';
        const ext = this.extensionDesdeContentType(contentType) || this.extensionDesdeUrl(url) || '.pdf';
        return res.blob().then(blob => ({ blob, ext }));
      })
      .then(({ blob, ext }) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${nombreBase}${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        const ext = this.extensionDesdeUrl(url) || '.pdf';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreBase}${ext}`;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  }

  private extensionDesdeContentType(contentType: string): string {
    if (contentType.includes('pdf')) return '.pdf';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('webp')) return '.webp';
    if (contentType.includes('gif')) return '.gif';
    return '';
  }

  private extensionDesdeUrl(url: string): string {
    const path = url.split('?')[0].toLowerCase();
    if (path.endsWith('.pdf') || path.includes('.pdf')) return '.pdf';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return '.jpg';
    if (path.endsWith('.png')) return '.png';
    if (path.endsWith('.webp')) return '.webp';
    if (path.endsWith('.gif')) return '.gif';
    return '';
  }

  imprimirReporteDesbloqueo(): void {
    if (!this.detalle) return;
    const numeroTurnoRef = this.numeroTurno || '-';
    this.empresaService.obtenerPrimera().pipe(catchError(() => of(null))).subscribe(empresa => {
      const logoUrl = empresa?.logoempresa?.trim() || '';
      const d = this.detalle!;
      const vehiculo = this.detalleVehiculo;
      const propietario = this.detallePropietario;
      const usuarioNombre = this.detalleUsuarioNombre || (d.usuarioDesactivaId?.toString() ?? '');
      const entidadNombre = this.detalleEntidadNombre || (d.entidadId?.toString() ?? '');
      const bloqueoRef = this.detalleBloqueoRef || (d.bloqueoId != null ? '#' + d.bloqueoId : '');
      const fechaStr = d.fechaDesactivacion ? new Date(d.fechaDesactivacion).toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const fechaEmision = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Desbloqueo #${d.idDesbloqueo ?? ''}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size:11pt; color:#222; padding:28px; max-width:600px; margin:0 auto; line-height:1.4; }
    .inf-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid #1a3d16; }
    .inf-logo { height:56px; width:auto; max-width:120px; object-fit:contain; }
    .inf-logo-fallback { border:2px solid #1a3d16; padding:6px 12px; font-weight:700; font-size:14px; color:#1a3d16; }
    .inf-titulo { text-align:right; }
    .inf-titulo .main { font-size:14pt; font-weight:700; color:#1a3d16; text-transform:uppercase; letter-spacing:0.5px; }
    .inf-titulo .sub { font-size:12pt; color:#333; margin-top:2px; }
    .inf-meta { font-size:10pt; color:#555; margin-bottom:18px; }
    .inf-sec { font-size:10pt; font-weight:700; color:#1a3d16; text-transform:uppercase; letter-spacing:0.5px; margin:14px 0 6px; padding-bottom:2px; border-bottom:1px solid #ccc; }
    .inf-tbl { width:100%; border-collapse:collapse; font-size:10pt; }
    .inf-tbl td { padding:3px 8px 3px 0; vertical-align:top; }
    .inf-lbl { color:#555; font-weight:600; width:38%; }
    .inf-val { color:#222; }
    .inf-pie { margin-top:24px; padding-top:10px; border-top:1px solid #ddd; font-size:9pt; color:#666; text-align:center; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body onload="window.focus(); window.print();">
  <script>window.addEventListener('afterprint', () => window.close());</script>
  <div class="inf-header">
    <div>${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="inf-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="inf-logo-fallback" style="display:none">EMPRESA</div>` : '<div class="inf-logo-fallback">EMPRESA</div>'}
    </div>
    <div class="inf-titulo">
      <div class="main">Informe técnico</div>
      <div class="sub">Desbloqueo de vehículo</div>
    </div>
  </div>
  <div class="inf-meta">Fecha de emisión: ${fechaEmision} &nbsp;|&nbsp; Código de informe: #${d.idDesbloqueo ?? '-'}</div>
  <div class="inf-sec">1. Referencias (turno y trámite)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Nº de turno:</td><td class="inf-val">${numeroTurnoRef}</td></tr>
    <tr><td class="inf-lbl">Nº de trámite:</td><td class="inf-val">${d.numeroTramite ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Tipo de trámite:</td><td class="inf-val">Desbloqueo de vehículo</td></tr>
  </table>
  <div class="inf-sec">2. Datos del propietario</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Nombre:</td><td class="inf-val">${propietario?.nombre ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Cédula/Identificación:</td><td class="inf-val">${propietario?.documentoIdentidad ?? '-'}</td></tr>
  </table>
  <div class="inf-sec">3. Datos del vehículo</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Placa:</td><td class="inf-val">${vehiculo?.matricula ?? '-'}</td><td class="inf-lbl">Chasis:</td><td class="inf-val">${vehiculo?.chasis ?? '-'}</td></tr>
    <tr><td class="inf-lbl">VIN:</td><td class="inf-val" colspan="3">${vehiculo?.vin ?? '-'}</td></tr>
  </table>
  <div class="inf-sec">4. Detalle del trámite (desbloqueo)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Entidad de tránsito:</td><td class="inf-val">${entidadNombre}</td></tr>
    <tr><td class="inf-lbl">Usuario que desactiva:</td><td class="inf-val">${usuarioNombre}</td></tr>
    <tr><td class="inf-lbl">Bloqueo de referencia:</td><td class="inf-val">${bloqueoRef}</td></tr>
    <tr><td class="inf-lbl">Motivo del levantamiento:</td><td class="inf-val">${d.motivoLevantamiento ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Fecha de desactivación:</td><td class="inf-val">${fechaStr}</td></tr>
    <tr><td class="inf-lbl">Estado:</td><td class="inf-val">${d.estado ?? '-'}</td></tr>
  </table>
  <div class="inf-pie">Documento generado por el sistema de Revisión Técnica Vehicular. Uso oficial.</div>
</body>
</html>`;
      const win = window.open('', '_blank', 'width=480,height=700,scrollbars=yes');
      if (!win) {
        this.notification.warn('Permite ventanas emergentes para imprimir el reporte.');
        return;
      }
      win.document.write(html);
      win.document.close();
    });
  }

  getEstadoBadge(estado: string): string {
    if (estado === 'CONCLUIDO') return 'badge-concluido';
    if (estado === 'ANULADO') return 'badge-anulado';
    return '';
  }
}
