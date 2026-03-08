import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BloqueoVehiculoService, BloqueoVehiculo } from '../../../services/rtv/BloqueoVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { TipoBloqueoService } from '../../../services/ant/tipo-bloqueo.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { UsuariosService } from '../../../services/administracion/usuarios.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TurnoRecepcionService, TurnoPagado } from '../../../services/administracion/turno-recepcion.service';
import { ServicioService } from '../../../services/administracion/servicio.service';

export interface TurnoParaSelector extends TurnoPagado {
  vehiculoDescripcion?: string;
  propietarioNombre?: string;
}

const BLOQUEO_VACIO: BloqueoVehiculo = {
  idBloqueoSrv: null,
  vehiculoId: null,
  entidadId: null,
  usuarioActivaId: null,
  numeroTramite: '',
  tipoBloqueoId: null,
  motivo: '',
  procesosBloqueados: 'TODOS',
  documentoHabilitante: '',
  institucionOrigen: '',
  fechaActivacion: '',
  estado: 'ACTIVO',
  observaciones: ''
};

@Component({
  selector: 'app-bloqueo-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './bloqueo-vehiculo.html',
  styleUrl: './bloqueo-vehiculo.css'
})
export class BloqueoVehiculoComponent implements OnInit {

  registros: BloqueoVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: BloqueoVehiculo = { ...BLOQUEO_VACIO };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: BloqueoVehiculo | null = null;
  cargandoDetalle = false;
  detalleVehiculo: Vehiculo | null = null;
  detallePropietario: { nombre: string; documentoIdentidad: string } | null = null;
  detalleEntidadNombre = '';
  detalleUsuarioNombre = '';
  detalleTipoBloqueoNombre = '';

  procesosBloqueadosOpciones = ['TODOS', 'TRANSFERENCIA', 'CASOS_ESPECIALES'];
  estadosOpciones = ['ACTIVO', 'DESACTIVADO'];

  // Selector Vehículo
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  // Documento habilitante (archivo)
  documentoHabilitanteFile: File | null = null;
  documentoHabilitanteUrl = '';
  uploadingDocumento = false;

  // Catálogos desde BD
  tiposBloqueo: { idTipoBloqueo: number; codigo: string; nombre: string }[] = [];
  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];
  institucionesOrigen: string[] = [];
  cargandoCatalogos = false;

  // Flujo desde Recepción o selector de turno
  fromRecepcion = false;
  turnoId: number | null = null;
  numeroTurno = '';
  recepcionVehiculoId: number | null = null;
  turnoSeleccionadoInfo: TurnoParaSelector | null = null;

  // Modal selector de turno
  mostrarModalTurno = false;
  cargandoTurnos = false;
  turnosDisponibles: TurnoParaSelector[] = [];
  /** ID del servicio "Bloqueo" para filtrar turnos a procesar. */
  servicioIdParaTurno: number | null = null;

  constructor(
    private service: BloqueoVehiculoService,
    private vehiculoService: VehiculoService,
    private propietarioService: PropietarioService,
    private tipoBloqueoService: TipoBloqueoService,
    private entidadesTransitoService: EntidadesTransitoService,
    private usuariosService: UsuariosService,
    private empresaService: EmpresaService,
    private cloudinaryService: CloudinaryService,
    private turnoRecepcionService: TurnoRecepcionService,
    private servicioService: ServicioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.cargarCatalogos();
    this.servicioService.listar().subscribe({
      next: (list) => {
        const s = (list ?? []).find(x =>
          x.nombre?.toLowerCase().includes('bloqueo') && !x.nombre?.toLowerCase().includes('desbloqueo')
        );
        this.servicioIdParaTurno = s?.idTipoTramite ?? null;
        this.cdr.detectChanges();
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['fromRecepcion'] === 'true') {
        this.fromRecepcion = true;
        this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
        this.numeroTurno = params['numeroTurno'] ?? `TRN-${this.turnoId}`;
        const vid = params['vehiculoId'] ? +params['vehiculoId'] : null;
        if (vid) this.recepcionVehiculoId = vid;
      }
    });
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.tipoBloqueoService.listar().subscribe({
      next: (data) => {
        this.tiposBloqueo = (data ?? []).map(t => ({ idTipoBloqueo: t.idTipoBloqueo, codigo: t.codigo, nombre: t.nombre }));
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); }
    });
    this.entidadesTransitoService.listar().subscribe({
      next: (data) => {
        this.entidadesTransito = (data ?? []).map(e => ({ idEntidad: e.idEntidad, codigo: e.codigo, nombre: e.nombre }));
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); }
    });
    this.tipoBloqueoService.listarInstituciones().subscribe({
      next: (data) => {
        this.institucionesOrigen = data ?? [];
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoCatalogos = false; this.cdr.detectChanges(); },
      complete: () => { this.cargandoCatalogos = false; this.cdr.detectChanges(); }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar los bloqueos de vehículos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): BloqueoVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivo?.toLowerCase().includes(f) ||
      r.institucionOrigen?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idBloqueoSrv?.toString() || '').includes(f)
    );
  }

  get paginados(): BloqueoVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...BLOQUEO_VACIO };
    if (this.fromRecepcion && this.recepcionVehiculoId) {
      this.editando.vehiculoId = this.recepcionVehiculoId;
      this.cargarVehiculoPorId(this.recepcionVehiculoId);
    } else if (this.turnoSeleccionadoInfo?.vehiculoId) {
      this.editando.vehiculoId = this.turnoSeleccionadoInfo.vehiculoId;
      this.cargarVehiculoPorId(this.turnoSeleccionadoInfo.vehiculoId);
    } else {
      this.vehiculoSeleccionadoInfo = null;
    }
    this.documentoHabilitanteUrl = this.editando.documentoHabilitante || '';
    this.documentoHabilitanteFile = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: BloqueoVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.documentoHabilitanteUrl = r.documentoHabilitante || '';
    this.documentoHabilitanteFile = null;
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.documentoHabilitanteUrl = '';
    this.documentoHabilitanteFile = null;
  }

  guardar(): void {
    if (!this.editando.vehiculoId || !this.editando.motivo?.trim()) {
      this.notification.error('Debe seleccionar un vehículo y especificar el motivo.');
      return;
    }
    if (!this.editando.entidadId) {
      this.notification.error('Debe seleccionar la entidad de tránsito.');
      return;
    }
    if (!this.editando.tipoBloqueoId) {
      this.notification.error('Debe seleccionar el tipo de bloqueo.');
      return;
    }
    if (!this.editando.institucionOrigen?.trim()) {
      this.notification.error('Debe seleccionar la institución de origen.');
      return;
    }
    if (!this.documentoHabilitanteUrl && !this.documentoHabilitanteFile) {
      this.notification.error('Debe adjuntar el documento habilitante.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idBloqueoSrv;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    if (!this.modoEdicion && !this.editando.numeroTramite) {
      this.editando.numeroTramite = 'BLQ-' + Date.now();
    }
    const guardarConDocumento = () => {
      if (this.documentoHabilitanteFile) {
        const isPdf = this.documentoHabilitanteFile.type === 'application/pdf';
        const upload$ = isPdf
          ? this.cloudinaryService.uploadPdf(this.documentoHabilitanteFile, 'documentos')
          : this.cloudinaryService.uploadImage(this.documentoHabilitanteFile, 'documentos');
        upload$.subscribe({
          next: (res) => {
            this.editando.documentoHabilitante = res.url;
            this.ejecutarGuardado(op);
          },
          error: () => { this.guardando = false; this.notification.error('Error al subir el documento.'); }
        });
      } else {
        this.editando.documentoHabilitante = this.documentoHabilitanteUrl;
        this.ejecutarGuardado(op);
      }
    };
    guardarConDocumento();
  }

  private ejecutarGuardado(op: ReturnType<BloqueoVehiculoService['crear']> | ReturnType<BloqueoVehiculoService['actualizar']>): void {
    op.subscribe({
      next: () => {
        if (this.turnoId) {
          const eraFromRecepcion = this.fromRecepcion;
          this.turnoRecepcionService.finalizarTurno(this.turnoId).subscribe({
            next: () => {
              this.notification.success('Bloqueo registrado y turno finalizado. No aparecerá en Recepción.');
              this.limpiarTurno();
              this.fromRecepcion = false;
              this.recepcionVehiculoId = null;
              this.cargar();
              this.cerrarModalForm();
              this.guardando = false;
              if (eraFromRecepcion) this.router.navigate(['/inicio/administracion/recepcion']);
            },
            error: () => {
              this.cargar();
              this.cerrarModalForm();
              this.guardando = false;
              this.notification.warn('Bloqueo guardado. No se pudo marcar el turno como finalizado.');
            }
          });
        } else {
          this.cargar();
          this.cerrarModalForm();
          this.guardando = false;
        }
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar el bloqueo.'); }
    });
  }

  abrirSelectorTurno(): void {
    this.mostrarModalTurno = true;
    this.cargarTurnosDisponibles();
  }

  cerrarSelectorTurno(): void {
    this.mostrarModalTurno = false;
  }

  cargarTurnosDisponibles(): void {
    this.cargandoTurnos = true;
    this.turnoRecepcionService.listarPagados(this.servicioIdParaTurno ?? undefined).pipe(
      catchError(() => of([]))
    ).subscribe(raw => {
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
      const propietarios$ = forkJoin(
        propietarioIds.map(id =>
          this.propietarioService.obtenerPorId(id).pipe(catchError(() => of({ idPropietario: id, nombre: '#' + id })))
        )
      );
      const vehiculos$ = forkJoin(
        vehiculoIds.map(id =>
          this.vehiculoService.obtenerPorId(id).pipe(catchError(() => of({ id: id, matricula: '#' + id })))
        )
      );
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

  // ===== Documento habilitante (archivo) =====
  onDocumentoHabilitanteSelected(event: Event): void {
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
      this.documentoHabilitanteFile = file;
      this.documentoHabilitanteUrl = ''; // Se subirá al guardar
      this.cdr.detectChanges();
    }
  }

  removerDocumentoHabilitante(): void {
    this.documentoHabilitanteFile = null;
    this.documentoHabilitanteUrl = '';
    if (this.modoEdicion) this.editando.documentoHabilitante = '';
    this.cdr.detectChanges();
  }

  verDetalle(r: BloqueoVehiculo): void {
    this.detalle = r;
    this.detalleVehiculo = null;
    this.detallePropietario = null;
    this.detalleEntidadNombre = '';
    this.detalleUsuarioNombre = '';
    this.detalleTipoBloqueoNombre = '';
    this.mostrarModalDetalle = true;
    this.cargandoDetalle = true;
    this.cdr.detectChanges();

    const entidad = r.entidadId != null ? this.entidadesTransito.find(e => e.idEntidad === r.entidadId) : null;
    const tipo = r.tipoBloqueoId != null ? this.tiposBloqueo.find(t => t.idTipoBloqueo === r.tipoBloqueoId) : null;
    this.detalleEntidadNombre = entidad ? `${entidad.codigo} - ${entidad.nombre}` : (r.entidadId?.toString() ?? '');
    this.detalleTipoBloqueoNombre = tipo ? `${tipo.codigo} - ${tipo.nombre}` : (r.tipoBloqueoId?.toString() ?? '');

    const loads: Array<{ vehiculo?: Vehiculo; propietario?: { nombre: string; documentoIdentidad: string }; usuario?: string }> = [];
    if (r.vehiculoId) {
      this.vehiculoService.obtenerPorId(r.vehiculoId).pipe(
        catchError(() => of(null))
      ).subscribe(v => {
        this.detalleVehiculo = v ?? null;
        if (v?.propietarioId) {
          this.propietarioService.obtenerPorId(v.propietarioId).pipe(
            catchError(() => of(null))
          ).subscribe(p => {
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
    if (r.usuarioActivaId) {
      this.usuariosService.obtenerUsuario(r.usuarioActivaId).pipe(
        catchError(() => of(null))
      ).subscribe(u => {
        this.detalleUsuarioNombre = u ? `${u.nombre} ${u.apellido}`.trim() : (r.usuarioActivaId?.toString() ?? '');
        this.cdr.detectChanges();
      });
    }
    if (!r.vehiculoId) this.cdr.detectChanges();
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.detalle = null;
    this.detalleVehiculo = null;
    this.detallePropietario = null;
  }

  abrirDocumento(url: string): void {
    if (url) window.open(url, '_blank');
  }

  descargarDocumento(url: string): void {
    if (!url) return;
    const id = this.detalle?.idBloqueoSrv ?? 'doc';
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
        a.download = `documento-bloqueo-${id}${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        const ext = this.extensionDesdeUrl(url) || '.pdf';
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-bloqueo-${id}${ext}`;
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
    if (path.endsWith('.pdf')) return '.pdf';
    if (path.includes('.pdf')) return '.pdf';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return '.jpg';
    if (path.endsWith('.png')) return '.png';
    if (path.endsWith('.webp')) return '.webp';
    if (path.endsWith('.gif')) return '.gif';
    return '';
  }

  imprimirReporteBloqueo(): void {
    if (!this.detalle) return;
    const numeroTurnoRef = this.numeroTurno || '-';
    this.empresaService.obtenerPrimera().pipe(
      catchError(() => of(null))
    ).subscribe(empresa => {
      const logoUrl = empresa?.logoempresa?.trim() || '';
      const vehiculo = this.detalleVehiculo;
      const propietario = this.detallePropietario;
      const usuarioNombre = this.detalleUsuarioNombre || (this.detalle?.usuarioActivaId?.toString() ?? '');
      const entidadNombre = this.detalleEntidadNombre || (this.detalle?.entidadId?.toString() ?? '');
      const tipoNombre = this.detalleTipoBloqueoNombre || (this.detalle?.tipoBloqueoId?.toString() ?? '');
      const d = this.detalle!;
      const fechaStr = d.fechaActivacion ? new Date(d.fechaActivacion).toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const fechaEmision = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Bloqueo #${d.idBloqueoSrv ?? ''}</title>
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
      <div class="sub">Bloqueo de vehículo</div>
    </div>
  </div>
  <div class="inf-meta">Fecha de emisión: ${fechaEmision} &nbsp;|&nbsp; Código de informe: #${d.idBloqueoSrv ?? '-'}</div>
  <div class="inf-sec">1. Referencias (turno y trámite)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Nº de turno:</td><td class="inf-val">${numeroTurnoRef}</td></tr>
    <tr><td class="inf-lbl">Nº de trámite:</td><td class="inf-val">${d.numeroTramite ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Tipo de trámite:</td><td class="inf-val">Bloqueo de vehículo</td></tr>
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
    <tr><td class="inf-lbl">Año:</td><td class="inf-val">${vehiculo?.anioFabricacion ?? '-'}</td><td class="inf-lbl">Color:</td><td class="inf-val">${vehiculo?.color ?? '-'}</td></tr>
  </table>
  <div class="inf-sec">4. Detalle del trámite (bloqueo)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Entidad de tránsito:</td><td class="inf-val">${entidadNombre}</td></tr>
    <tr><td class="inf-lbl">Usuario que activa:</td><td class="inf-val">${usuarioNombre}</td></tr>
    <tr><td class="inf-lbl">Tipo de bloqueo:</td><td class="inf-val">${tipoNombre}</td></tr>
    <tr><td class="inf-lbl">Institución de origen:</td><td class="inf-val">${d.institucionOrigen ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Motivo:</td><td class="inf-val">${d.motivo ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Procesos bloqueados:</td><td class="inf-val">${d.procesosBloqueados ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Fecha de activación:</td><td class="inf-val">${fechaStr}</td></tr>
    <tr><td class="inf-lbl">Estado:</td><td class="inf-val">${d.estado ?? '-'}</td></tr>
    ${d.observaciones ? `<tr><td class="inf-lbl">Observaciones:</td><td class="inf-val">${d.observaciones}</td></tr>` : ''}
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
    if (estado === 'ACTIVO') return 'badge-activo';
    if (estado === 'DESACTIVADO') return 'badge-desactivado';
    return '';
  }
}
