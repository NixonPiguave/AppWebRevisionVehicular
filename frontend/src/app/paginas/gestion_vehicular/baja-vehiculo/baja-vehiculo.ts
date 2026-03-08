import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BajaVehiculoService, BajaVehiculo } from '../../../services/rtv/BajaVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { Propietario, PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { UsuariosService } from '../../../services/administracion/usuarios.service';
import { EmpresaService } from '../../../services/administracion/empresa.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';
import { TurnoRecepcionService, TurnoPagado } from '../../../services/administracion/turno-recepcion.service';
import { ServicioService } from '../../../services/administracion/servicio.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface TurnoParaSelector extends TurnoPagado {
  vehiculoDescripcion?: string;
  propietarioNombre?: string;
}

const BAJA_VACIA: BajaVehiculo = {
  idBaja: null,
  tramiteId: null,
  vehiculoId: null,
  propietarioId: null,
  entidadId: null,
  usuarioId: null,
  numeroTramite: '',
  motivoBaja: 'VIDA_UTIL',
  descripcionMotivo: '',
  inspeccion1Id: null,
  inspeccion2Id: null,
  inspeccion3Id: null,
  empresaChatarrizado: '',
  certChatarrizado: '',
  fechaChatarrizado: '',
  ordenJudicial: '',
  constanciaPolicial: '',
  notificadoSri: 'NO',
  fechaNotificacionSri: '',
  estado: 'CONCLUIDO',
  fechaSolicitud: '',
  fechaConclusion: ''
};

@Component({
  selector: 'app-baja-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './baja-vehiculo.html',
  styleUrl: './baja-vehiculo.css'
})
export class BajaVehiculoComponent implements OnInit {

  registros: BajaVehiculo[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  editando: BajaVehiculo = { ...BAJA_VACIA };
  guardando = false;

  mostrarModalDetalle = false;
  detalle: BajaVehiculo | null = null;
  cargandoDetalle = false;
  detalleVehiculo: Vehiculo | null = null;
  detallePropietario: Propietario | null = null;
  detalleEntidadNombre = '';
  detalleUsuarioNombre = '';
  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];

  motivosBaja = ['VIDA_UTIL', 'NO_APROBACION_RTV', 'SINIESTRO', 'ROBO', 'JUDICIAL'];
  estadosOpciones = ['CONCLUIDO', 'PENDIENTE', 'ANULADO'];
  notificadoSriOpciones = ['SI', 'NO'];

  // Selector Vehículo
  mostrarModalVehiculo = false;
  cargandoVehiculos = false;
  vehiculosEncontrados: Vehiculo[] = [];
  busquedaPlaca = '';
  vehiculoSeleccionadoInfo: Vehiculo | null = null;

  // Selector Propietario
  mostrarModalPropietario = false;
  cargandoPropietarios = false;
  propietariosEncontrados: Propietario[] = [];
  busquedaCedula = '';
  propietarioSeleccionadoInfo: Propietario | null = null;

  // Documentos (archivos)
  certChatarrizadoFile: File | null = null;
  certChatarrizadoUrl = '';
  ordenJudicialFile: File | null = null;
  ordenJudicialUrl = '';
  constanciaPolicialFile: File | null = null;
  constanciaPolicialUrl = '';
  uploadingDoc = false;

  // ── Flujo desde Recepción / selector de turno ──────────
  fromRecepcion = false;
  turnoId: number | null = null;
  numeroTurno = '';
  turnoSeleccionadoInfo: TurnoParaSelector | null = null;
  turnosDisponibles: TurnoParaSelector[] = [];
  mostrarModalTurno = false;
  cargandoTurnos = false;
  finalizando = false;
  /** ID del servicio "Baja" para filtrar turnos a procesar. */
  servicioIdParaTurno: number | null = null;

  constructor(
    private service: BajaVehiculoService,
    private vehiculoService: VehiculoService,
    private propietarioService: PropietarioService,
    private entidadesTransitoService: EntidadesTransitoService,
    private usuariosService: UsuariosService,
    private empresaService: EmpresaService,
    private cloudinaryService: CloudinaryService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private turnoRecepcionService: TurnoRecepcionService,
    private servicioService: ServicioService
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
        const s = (list ?? []).find(x => x.nombre?.toLowerCase().includes('baja'));
        this.servicioIdParaTurno = s?.idTipoTramite ?? null;
        this.cdr.detectChanges();
      }
    });

    // Detectar si viene de Recepción con un turno
    this.route.queryParams.subscribe(params => {
      if (params['fromRecepcion'] === 'true') {
        this.fromRecepcion = true;
        this.turnoId = params['turnoId'] ? +params['turnoId'] : null;
        this.numeroTurno = this.turnoId ? 'TRN-' + this.turnoId : '';

        // Pre-cargar datos del turno y abrir modal de creación
        this.abrirModalCrear();
        this.editando.tramiteId     = params['tramiteId']     ? +params['tramiteId']     : null;
        this.editando.vehiculoId    = params['vehiculoId']    ? +params['vehiculoId']    : null;
        this.editando.propietarioId = params['propietarioId'] ? +params['propietarioId'] : null;
        this.editando.numeroTramite = params['numeroTurno']   || this.numeroTurno || '';
        this.editando.fechaSolicitud = new Date().toISOString().slice(0, 16);

        if (this.editando.vehiculoId)    this.cargarVehiculoPorId(this.editando.vehiculoId);
        if (this.editando.propietarioId) this.cargarPropietarioPorId(this.editando.propietarioId);
      }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar las bajas de vehículos.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): BajaVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramite?.toLowerCase().includes(f) ||
      r.motivoBaja?.toLowerCase().includes(f) ||
      r.descripcionMotivo?.toLowerCase().includes(f) ||
      r.estado?.toLowerCase().includes(f) ||
      (r.idBaja?.toString() || '').includes(f)
    );
  }

  get paginados(): BajaVehiculo[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = { ...BAJA_VACIA };
    this.vehiculoSeleccionadoInfo = null;
    this.propietarioSeleccionadoInfo = null;
    this.resetDocumentos();
    if (!this.fromRecepcion) this.limpiarTurno();
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: BajaVehiculo): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.certChatarrizadoUrl = r.certChatarrizado || '';
    this.ordenJudicialUrl = r.ordenJudicial || '';
    this.constanciaPolicialUrl = r.constanciaPolicial || '';
    this.certChatarrizadoFile = this.ordenJudicialFile = this.constanciaPolicialFile = null;
    if (this.editando.vehiculoId) this.cargarVehiculoPorId(this.editando.vehiculoId);
    else this.vehiculoSeleccionadoInfo = null;
    if (this.editando.propietarioId) this.cargarPropietarioPorId(this.editando.propietarioId);
    else this.propietarioSeleccionadoInfo = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.resetDocumentos();
    // Si vino de recepción y cierra sin guardar, regresa
    if (this.fromRecepcion) {
      this.fromRecepcion = false;
      this.turnoId = null;
      this.router.navigate(['/inicio/operaciones/recepcion']);
    }
  }

  private resetDocumentos(): void {
    this.certChatarrizadoUrl = '';
    this.certChatarrizadoFile = null;
    this.ordenJudicialUrl = '';
    this.ordenJudicialFile = null;
    this.constanciaPolicialUrl = '';
    this.constanciaPolicialFile = null;
  }

  // Texto dinámico del botón según contexto
  get textoBotonGuardar(): string {
    if (this.guardando || this.finalizando) return 'Procesando...';
    if (this.turnoId) return 'Registrar Baja y Finalizar Turno';
    return this.modoEdicion ? 'Guardar Cambios' : 'Registrar Baja';
  }

  get iconoBotonGuardar(): string {
    if (this.turnoId) return 'task_alt';
    return this.modoEdicion ? 'save' : 'remove_circle';
  }

  guardar(): void {
    if (!this.editando.vehiculoId || !this.editando.propietarioId || !this.editando.motivoBaja) {
      this.notification.error('Debe seleccionar vehículo, propietario y motivo de baja.');
      return;
    }
    if (!this.editando.entidadId) {
      this.notification.error('Debe seleccionar la entidad de tránsito.');
      return;
    }
    if (this.requiereChatarrizado() && !this.certChatarrizadoUrl && !this.certChatarrizadoFile) {
      this.notification.error('Debe adjuntar el certificado de chatarrizado.');
      return;
    }
    if (this.requiereOrdenJudicial() && !this.ordenJudicialUrl && !this.ordenJudicialFile) {
      this.notification.error('Debe adjuntar la orden judicial.');
      return;
    }
    if (this.requiereConstanciaPolicial() && !this.constanciaPolicialUrl && !this.constanciaPolicialFile) {
      this.notification.error('Debe adjuntar la constancia policial.');
      return;
    }

    this.guardando = true;

    if (!this.modoEdicion && !this.editando.numeroTramite) {
      this.editando.numeroTramite = 'BAJ-' + Date.now();
    }

    const id = this.editando.idBaja;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    const subirYGuardar = () => {
      if (this.requiereChatarrizado()) {
        if (this.certChatarrizadoFile) {
          const isPdf = this.certChatarrizadoFile.type === 'application/pdf';
          const upload$ = isPdf
            ? this.cloudinaryService.uploadPdf(this.certChatarrizadoFile, 'documentos')
            : this.cloudinaryService.uploadImage(this.certChatarrizadoFile, 'documentos');
          upload$.subscribe({
            next: (res) => { this.editando.certChatarrizado = res.url; subirOrdenYConstanciaYGuardar(op); },
            error: () => { this.guardando = false; this.notification.error('Error al subir certificado.'); }
          });
        } else {
          this.editando.certChatarrizado = this.certChatarrizadoUrl;
          subirOrdenYConstanciaYGuardar(op);
        }
      } else {
        subirOrdenYConstanciaYGuardar(op);
      }
    };

    const subirOrdenYConstanciaYGuardar = (operacion: ReturnType<BajaVehiculoService['crear']> | ReturnType<BajaVehiculoService['actualizar']>) => {
      if (this.requiereOrdenJudicial()) {
        if (this.ordenJudicialFile) {
          const isPdf = this.ordenJudicialFile.type === 'application/pdf';
          const upload$ = isPdf
            ? this.cloudinaryService.uploadPdf(this.ordenJudicialFile, 'documentos')
            : this.cloudinaryService.uploadImage(this.ordenJudicialFile, 'documentos');
          upload$.subscribe({
            next: (res) => { this.editando.ordenJudicial = res.url; subirConstanciaYGuardar(operacion); },
            error: () => { this.guardando = false; this.notification.error('Error al subir orden judicial.'); }
          });
        } else {
          this.editando.ordenJudicial = this.ordenJudicialUrl;
          subirConstanciaYGuardar(operacion);
        }
      } else {
        subirConstanciaYGuardar(operacion);
      }
    };

    const subirConstanciaYGuardar = (operacion: ReturnType<BajaVehiculoService['crear']> | ReturnType<BajaVehiculoService['actualizar']>) => {
      if (this.requiereConstanciaPolicial()) {
        if (this.constanciaPolicialFile) {
          const isPdf = this.constanciaPolicialFile.type === 'application/pdf';
          const upload$ = isPdf
            ? this.cloudinaryService.uploadPdf(this.constanciaPolicialFile, 'documentos')
            : this.cloudinaryService.uploadImage(this.constanciaPolicialFile, 'documentos');
          upload$.subscribe({
            next: (res) => { this.editando.constanciaPolicial = res.url; this.ejecutarGuardado(operacion); },
            error: () => { this.guardando = false; this.notification.error('Error al subir constancia policial.'); }
          });
        } else {
          this.editando.constanciaPolicial = this.constanciaPolicialUrl;
          this.ejecutarGuardado(operacion);
        }
      } else {
        this.ejecutarGuardado(operacion);
      }
    };

    subirYGuardar();
  }

  private ejecutarGuardado(op: ReturnType<BajaVehiculoService['crear']> | ReturnType<BajaVehiculoService['actualizar']>): void {
    op.subscribe({
      next: () => {
        this.guardando = false;
        this.cargar();
        this.resetDocumentos();

        if (this.turnoId) {
          this.mostrarModalForm = false;
          this.finalizarTurnoYRegresar();
        } else {
          this.cerrarModalForm();
        }
      },
      error: () => {
        this.guardando = false;
        this.notification.error('Error al guardar la baja del vehículo.');
      }
    });
  }

  private finalizarTurnoYRegresar(): void {
    if (!this.turnoId) return;
    const eraFromRecepcion = this.fromRecepcion;
    this.finalizando = true;
    this.turnoRecepcionService.finalizarTurno(this.turnoId).subscribe({
      next: () => {
        this.finalizando = false;
        this.limpiarTurno();
        this.fromRecepcion = false;
        this.notification.success('Baja registrada y turno finalizado. No aparecerá en Recepción.');
        this.cerrarModalForm();
        if (eraFromRecepcion) this.router.navigate(['/inicio/operaciones/recepcion']);
      },
      error: () => {
        this.finalizando = false;
        this.notification.warn('Baja guardada. No se pudo marcar el turno como finalizado.');
        this.limpiarTurno();
        this.fromRecepcion = false;
        this.cerrarModalForm();
        if (eraFromRecepcion) this.router.navigate(['/inicio/operaciones/recepcion']);
      }
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
    if (t.propietarioId) {
      this.editando.propietarioId = t.propietarioId;
      this.cargarPropietarioPorId(t.propietarioId);
    }
    if (t.entidadId != null) this.editando.entidadId = t.entidadId;
    this.editando.numeroTramite = this.numeroTurno;
    this.editando.fechaSolicitud = new Date().toISOString().slice(0, 16);
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
      next: (v) => { this.vehiculoSeleccionadoInfo = v; this.cdr.detectChanges(); },
      error: () => console.warn('No se pudo cargar vehículo por ID')
    });
  }

  // ===== Selector Propietario =====
  abrirSelectorPropietario(): void {
    this.mostrarModalPropietario = true;
    this.busquedaCedula = this.propietarioSeleccionadoInfo?.documentoIdentidad ?? this.busquedaCedula;
    this.buscarPropietarios();
  }

  cerrarSelectorPropietario(): void { this.mostrarModalPropietario = false; }

  buscarPropietarios(): void {
    this.cargandoPropietarios = true;
    this.propietarioService.listarElegibles(this.busquedaCedula).subscribe({
      next: (data) => {
        this.propietariosEncontrados = data ?? [];
        this.cargandoPropietarios = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoPropietarios = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarPropietario(p: Propietario): void {
    this.propietarioSeleccionadoInfo = p;
    this.editando.propietarioId = (p.idPropietario ?? 0) as number;
    this.cerrarSelectorPropietario();
  }

  limpiarPropietario(): void {
    this.propietarioSeleccionadoInfo = null;
    this.editando.propietarioId = null;
  }

  private cargarPropietarioPorId(id: number): void {
    if (!id || id <= 0) return;
    this.propietarioService.obtenerPorId(id).subscribe({
      next: (p) => { this.propietarioSeleccionadoInfo = p; this.cdr.detectChanges(); },
      error: () => console.warn('No se pudo cargar propietario por ID')
    });
  }

  // ===== Documentos (archivos) =====
  private validarArchivo(file: File): boolean {
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      this.notification.error('Solo se permiten PDF o imágenes.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.notification.error('El archivo no debe superar 5MB.');
      return false;
    }
    return true;
  }

  onCertChatarrizadoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.certChatarrizadoFile = input.files[0];
      this.certChatarrizadoUrl = '';
      this.cdr.detectChanges();
    }
  }

  removerCertChatarrizado(): void {
    this.certChatarrizadoFile = null;
    this.certChatarrizadoUrl = '';
    if (this.modoEdicion) this.editando.certChatarrizado = '';
    this.cdr.detectChanges();
  }

  onOrdenJudicialSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.ordenJudicialFile = input.files[0];
      this.ordenJudicialUrl = '';
      this.cdr.detectChanges();
    }
  }

  removerOrdenJudicial(): void {
    this.ordenJudicialFile = null;
    this.ordenJudicialUrl = '';
    if (this.modoEdicion) this.editando.ordenJudicial = '';
    this.cdr.detectChanges();
  }

  onConstanciaPolicialSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.constanciaPolicialFile = input.files[0];
      this.constanciaPolicialUrl = '';
      this.cdr.detectChanges();
    }
  }

  removerConstanciaPolicial(): void {
    this.constanciaPolicialFile = null;
    this.constanciaPolicialUrl = '';
    if (this.modoEdicion) this.editando.constanciaPolicial = '';
    this.cdr.detectChanges();
  }

  verDetalle(r: BajaVehiculo): void {
    this.detalle = r;
    this.detalleVehiculo = null;
    this.detallePropietario = null;
    this.detalleEntidadNombre = '';
    this.detalleUsuarioNombre = '';
    this.mostrarModalDetalle = true;
    this.cargandoDetalle = true;
    this.cdr.detectChanges();

    const entidad = r.entidadId != null ? this.entidadesTransito.find(e => e.idEntidad === r.entidadId) : null;
    this.detalleEntidadNombre = entidad ? `${entidad.codigo} - ${entidad.nombre}` : (r.entidadId?.toString() ?? '');

    if (r.vehiculoId) {
      this.vehiculoService.obtenerPorId(r.vehiculoId).pipe(catchError(() => of(null))).subscribe(v => {
        this.detalleVehiculo = v ?? null;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      });
    } else {
      this.cargandoDetalle = false;
      this.cdr.detectChanges();
    }
    if (r.propietarioId) {
      this.propietarioService.obtenerPorId(r.propietarioId).pipe(catchError(() => of(null))).subscribe(p => {
        this.detallePropietario = p ?? null;
        this.cdr.detectChanges();
      });
    }
    if (r.usuarioId) {
      this.usuariosService.obtenerUsuario(r.usuarioId).pipe(catchError(() => of(null))).subscribe(u => {
        this.detalleUsuarioNombre = u ? `${u.nombre} ${u.apellido}`.trim() : (r.usuarioId?.toString() ?? '');
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

  imprimirReporteBaja(): void {
    if (!this.detalle) return;
    const numeroTurnoRef = this.turnoId ? `TRN-${this.turnoId}` : '-';
    this.empresaService.obtenerPrimera().pipe(catchError(() => of(null))).subscribe(empresa => {
      const logoUrl = empresa?.logoempresa?.trim() || '';
      const d = this.detalle!;
      const vehiculo = this.detalleVehiculo;
      const propietario = this.detallePropietario;
      const usuarioNombre = this.detalleUsuarioNombre || (d.usuarioId?.toString() ?? '');
      const entidadNombre = this.detalleEntidadNombre || (d.entidadId?.toString() ?? '');
      const fechaSolicitudStr = d.fechaSolicitud ? new Date(d.fechaSolicitud).toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
      const fechaConclusionStr = d.fechaConclusion ? new Date(d.fechaConclusion).toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
      const fechaChatarrizadoStr = d.fechaChatarrizado ? new Date(d.fechaChatarrizado).toLocaleDateString('es-EC') : '-';
      const fechaEmision = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Baja #${d.idBaja ?? ''}</title>
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
      <div class="sub">Baja de vehículo</div>
    </div>
  </div>
  <div class="inf-meta">Fecha de emisión: ${fechaEmision} &nbsp;|&nbsp; Código de informe: #${d.idBaja ?? '-'}</div>
  <div class="inf-sec">1. Referencias (turno y trámite)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Nº de turno:</td><td class="inf-val">${numeroTurnoRef}</td></tr>
    <tr><td class="inf-lbl">Nº de trámite:</td><td class="inf-val">${d.numeroTramite ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Tipo de trámite:</td><td class="inf-val">Baja de vehículo</td></tr>
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
  <div class="inf-sec">4. Detalle del trámite (baja)</div>
  <table class="inf-tbl">
    <tr><td class="inf-lbl">Entidad de tránsito:</td><td class="inf-val">${entidadNombre}</td></tr>
    <tr><td class="inf-lbl">Usuario:</td><td class="inf-val">${usuarioNombre}</td></tr>
    <tr><td class="inf-lbl">Motivo de baja:</td><td class="inf-val">${d.motivoBaja ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Descripción del motivo:</td><td class="inf-val">${d.descripcionMotivo ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Empresa chatarrizado:</td><td class="inf-val">${d.empresaChatarrizado ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Fecha chatarrizado:</td><td class="inf-val">${fechaChatarrizadoStr}</td></tr>
    <tr><td class="inf-lbl">Notificado SRI:</td><td class="inf-val">${d.notificadoSri ?? '-'}</td></tr>
    <tr><td class="inf-lbl">Fecha notificación SRI:</td><td class="inf-val">${d.fechaNotificacionSri ? new Date(d.fechaNotificacionSri).toLocaleDateString('es-EC') : '-'}</td></tr>
    <tr><td class="inf-lbl">Fecha solicitud:</td><td class="inf-val">${fechaSolicitudStr}</td></tr>
    <tr><td class="inf-lbl">Fecha conclusión:</td><td class="inf-val">${fechaConclusionStr}</td></tr>
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
    if (estado === 'PENDIENTE') return 'badge-pendiente';
    if (estado === 'ANULADO')   return 'badge-anulado';
    return '';
  }

  requiereChatarrizado(): boolean {
    return ['VIDA_UTIL', 'SINIESTRO'].includes(this.editando.motivoBaja);
  }

  requiereInspecciones(): boolean {
    return this.editando.motivoBaja === 'NO_APROBACION_RTV';
  }

  requiereOrdenJudicial(): boolean {
    return this.editando.motivoBaja === 'JUDICIAL';
  }

  requiereConstanciaPolicial(): boolean {
    return this.editando.motivoBaja === 'ROBO';
  }
}
