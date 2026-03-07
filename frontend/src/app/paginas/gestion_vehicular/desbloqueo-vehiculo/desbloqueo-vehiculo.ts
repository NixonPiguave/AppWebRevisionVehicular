import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DesbloqueoVehiculoService, DesbloqueoVehiculo } from '../../../services/rtv/DesbloqueoVehiculo.service';
import { BloqueoVehiculoService, BloqueoVehiculo } from '../../../services/rtv/BloqueoVehiculo.service';
import { Vehiculo, VehiculoService } from '../../../services/gestion_vehicular/vehiculo.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

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

  constructor(
    private service: DesbloqueoVehiculoService,
    private bloqueoService: BloqueoVehiculoService,
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
      alert('Debe seleccionar bloqueo, vehículo y especificar el motivo.');
      return;
    }
    if (!this.documentoLevantamientoUrl && !this.documentoLevantamientoFile) {
      alert('Debe adjuntar el documento de levantamiento.');
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
          error: () => { this.guardando = false; alert('Error al subir el documento.'); }
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
      next: () => { this.cargar(); this.cerrarModalForm(); this.guardando = false; },
      error: () => { this.guardando = false; alert('Error al guardar el desbloqueo.'); }
    });
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
    if (b.vehiculoId) {
      this.editando.vehiculoId = b.vehiculoId;
      this.cargarVehiculoPorId(b.vehiculoId);
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

  verDetalle(r: DesbloqueoVehiculo): void { this.detalle = r; this.mostrarModalDetalle = true; }
  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }

  getEstadoBadge(estado: string): string {
    if (estado === 'CONCLUIDO') return 'badge-concluido';
    if (estado === 'ANULADO') return 'badge-anulado';
    return '';
  }
}
