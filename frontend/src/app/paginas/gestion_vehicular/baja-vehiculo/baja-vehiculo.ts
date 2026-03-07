import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BajaVehiculoService, BajaVehiculo } from '../../../services/rtv/BajaVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { Propietario, PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

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

  // Turno vinculado (desde Recepción)
  turnoIdVinculado: number | null = null;

  constructor(
    private service: BajaVehiculoService,
    private vehiculoService: VehiculoService,
    private propietarioService: PropietarioService,
    private cloudinaryService: CloudinaryService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();

    // Leer queryParams enviados desde Recepción
    this.route.queryParams.subscribe(params => {
      const turnoId      = params['turnoId']      ? +params['turnoId']      : null;
      const vehiculoId   = params['vehiculoId']   ? +params['vehiculoId']   : null;
      const propietarioId = params['propietarioId'] ? +params['propietarioId'] : null;

      if (turnoId && vehiculoId) {
        this.turnoIdVinculado = turnoId;
        this.abrirModalCrear();
        this.editando.vehiculoId    = vehiculoId;
        this.editando.tramiteId     = turnoId;
        if (propietarioId) {
          this.editando.propietarioId = propietarioId;
          this.cargarPropietarioPorId(propietarioId);
        }
        this.cargarVehiculoPorId(vehiculoId);
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
  }

  private resetDocumentos(): void {
    this.certChatarrizadoUrl = '';
    this.certChatarrizadoFile = null;
    this.ordenJudicialUrl = '';
    this.ordenJudicialFile = null;
    this.constanciaPolicialUrl = '';
    this.constanciaPolicialFile = null;
  }

  guardar(): void {
    if (!this.editando.vehiculoId || !this.editando.propietarioId || !this.editando.motivoBaja) {
      alert('Debe seleccionar vehículo, propietario y motivo de baja.');
      return;
    }
    if (this.requiereChatarrizado() && !this.certChatarrizadoUrl && !this.certChatarrizadoFile) {
      alert('Debe adjuntar el certificado de chatarrizado.');
      return;
    }
    if (this.requiereOrdenJudicial() && !this.ordenJudicialUrl && !this.ordenJudicialFile) {
      alert('Debe adjuntar la orden judicial.');
      return;
    }
    if (this.requiereConstanciaPolicial() && !this.constanciaPolicialUrl && !this.constanciaPolicialFile) {
      alert('Debe adjuntar la constancia policial.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idBaja;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);

    if (!this.modoEdicion && !this.editando.numeroTramite) {
      this.editando.numeroTramite = 'BAJ-' + Date.now();
    }

    const subirYGuardar = () => {
      if (this.requiereChatarrizado()) {
        if (this.certChatarrizadoFile) {
          const isPdf = this.certChatarrizadoFile.type === 'application/pdf';
          const upload$ = isPdf
            ? this.cloudinaryService.uploadPdf(this.certChatarrizadoFile, 'documentos')
            : this.cloudinaryService.uploadImage(this.certChatarrizadoFile, 'documentos');
          upload$.subscribe({
            next: (res) => { this.editando.certChatarrizado = res.url; subirOrdenYConstanciaYGuardar(op); },
            error: () => { this.guardando = false; alert('Error al subir certificado.'); }
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
            error: () => { this.guardando = false; alert('Error al subir orden judicial.'); }
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
            error: () => { this.guardando = false; alert('Error al subir constancia policial.'); }
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
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar la baja del vehículo.'); }
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
      next: (data) => { this.vehiculosEncontrados = data ?? []; this.cargandoVehiculos = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoVehiculos = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarVehiculo(v: Vehiculo): void {
    this.vehiculoSeleccionadoInfo = v;
    this.editando.vehiculoId = (v.id ?? 0) as number;
    this.cerrarSelectorVehiculo();
  }

  limpiarVehiculo(): void { this.vehiculoSeleccionadoInfo = null; this.editando.vehiculoId = null; }

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
      next: (data) => { this.propietariosEncontrados = data ?? []; this.cargandoPropietarios = false; this.cdr.detectChanges(); },
      error: () => { this.cargandoPropietarios = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarPropietario(p: Propietario): void {
    this.propietarioSeleccionadoInfo = p;
    this.editando.propietarioId = (p.idPropietario ?? 0) as number;
    this.cerrarSelectorPropietario();
  }

  limpiarPropietario(): void { this.propietarioSeleccionadoInfo = null; this.editando.propietarioId = null; }

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
    if (!isPdf && !isImage) { alert('Solo se permiten PDF o imágenes.'); return false; }
    if (file.size > 5 * 1024 * 1024) { alert('El archivo no debe superar 5MB.'); return false; }
    return true;
  }

  onCertChatarrizadoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.certChatarrizadoFile = input.files[0]; this.certChatarrizadoUrl = ''; this.cdr.detectChanges();
    }
  }

  removerCertChatarrizado(): void {
    this.certChatarrizadoFile = null; this.certChatarrizadoUrl = '';
    if (this.modoEdicion) this.editando.certChatarrizado = '';
    this.cdr.detectChanges();
  }

  onOrdenJudicialSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.ordenJudicialFile = input.files[0]; this.ordenJudicialUrl = ''; this.cdr.detectChanges();
    }
  }

  removerOrdenJudicial(): void {
    this.ordenJudicialFile = null; this.ordenJudicialUrl = '';
    if (this.modoEdicion) this.editando.ordenJudicial = '';
    this.cdr.detectChanges();
  }

  onConstanciaPolicialSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0] && this.validarArchivo(input.files[0])) {
      this.constanciaPolicialFile = input.files[0]; this.constanciaPolicialUrl = ''; this.cdr.detectChanges();
    }
  }

  removerConstanciaPolicial(): void {
    this.constanciaPolicialFile = null; this.constanciaPolicialUrl = '';
    if (this.modoEdicion) this.editando.constanciaPolicial = '';
    this.cdr.detectChanges();
  }

  verDetalle(r: BajaVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'CONCLUIDO') return 'badge-concluido';
    if (estado === 'PENDIENTE') return 'badge-pendiente';
    if (estado === 'ANULADO') return 'badge-anulado';
    return '';
  }

  requiereChatarrizado(): boolean { return ['VIDA_UTIL', 'SINIESTRO'].includes(this.editando.motivoBaja); }
  requiereInspecciones(): boolean { return this.editando.motivoBaja === 'NO_APROBACION_RTV'; }
  requiereOrdenJudicial(): boolean { return this.editando.motivoBaja === 'JUDICIAL'; }
  requiereConstanciaPolicial(): boolean { return this.editando.motivoBaja === 'ROBO'; }
}
