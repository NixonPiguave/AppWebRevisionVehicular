import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BloqueoVehiculoService, BloqueoVehiculo } from '../../../services/rtv/BloqueoVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

const BLOQUEO_VACIO: BloqueoVehiculo = {
  idBloqueoSrv: null,
  tramiteId: null,
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

  constructor(
    private service: BloqueoVehiculoService,
    private vehiculoService: VehiculoService,
    private cloudinaryService: CloudinaryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.cargar(); }

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
    this.vehiculoSeleccionadoInfo = null;
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
      alert('Debe seleccionar un vehículo y especificar el motivo.');
      return;
    }
    if (!this.documentoHabilitanteUrl && !this.documentoHabilitanteFile) {
      alert('Debe adjuntar el documento habilitante.');
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
          error: () => { this.guardando = false; alert('Error al subir el documento.'); }
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
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar el bloqueo.'); }
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

  // ===== Documento habilitante (archivo) =====
  onDocumentoHabilitanteSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPdf && !isImage) {
        alert('Solo se permiten PDF o imágenes (JPG, PNG, etc.)');
        input.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`El archivo no debe superar 5MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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

  verDetalle(r: BloqueoVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'ACTIVO') return 'badge-activo';
    if (estado === 'DESACTIVADO') return 'badge-desactivado';
    return '';
  }
}
