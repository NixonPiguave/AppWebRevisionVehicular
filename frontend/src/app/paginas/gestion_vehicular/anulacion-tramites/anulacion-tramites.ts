import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnulacionTramiteService, AnulacionTramite } from '../../../services/rtv/AnulacionTramite.service';
import { EntidadesTransitoService } from '../../../services/ant/entidades-transito.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-anulacion-tramites',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './anulacion-tramites.html',
  styleUrl: './anulacion-tramites.css'
})
export class AnulacionTramitesComponent implements OnInit {
  registros: AnulacionTramite[] = [];
  cargando = false;
  error = '';
  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;
  mostrarModalForm = false;
  modoEdicion = false;
  editando: AnulacionTramite = {
    tramiteAnuladoId: null,
    entidadId: null,
    numeroTramiteAnulado: '',
    estadoTramiteAlAnular: 'EN_PROCESO',
    motivoAnulacion: '',
    pagosRevertidos: 'NO',
    multasDevueltas: 'NO',
    estado: 'ANULADO'
  };
  guardando = false;
  mostrarModalDetalle = false;
  detalle: AnulacionTramite | null = null;
  detalleEntidadNombre = '';
  entidadesTransito: { idEntidad: number; codigo: string; nombre: string }[] = [];

  constructor(
    private service: AnulacionTramiteService,
    private entidadesTransitoService: EntidadesTransitoService,
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
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.registros = data; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Error al cargar anulaciones.'; this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  get filtrados(): AnulacionTramite[] {
    const f = this.filtro.toLowerCase();
    return this.registros.filter(r =>
      r.numeroTramiteAnulado?.toLowerCase().includes(f) ||
      r.motivoAnulacion?.toLowerCase().includes(f) ||
      (r.idAnulacionSrv?.toString() || '').includes(f)
    );
  }

  get paginados(): AnulacionTramite[] {
    const ini = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(ini, ini + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.filtrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.editando = {
      tramiteAnuladoId: null,
      entidadId: null,
      numeroTramiteAnulado: '',
      estadoTramiteAlAnular: 'EN_PROCESO',
      motivoAnulacion: '',
      pagosRevertidos: 'NO',
      multasDevueltas: 'NO',
      estado: 'ANULADO'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(r: AnulacionTramite): void {
    this.modoEdicion = true;
    this.editando = { ...r };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardar(): void {
    if (!this.editando.tramiteAnuladoId) {
      this.notification.error('Debe indicar el ID del trámite a anular.');
      return;
    }
    if (!this.editando.entidadId) {
      this.notification.error('Debe seleccionar entidad de tránsito.');
      return;
    }
    if (!this.editando.motivoAnulacion?.trim()) {
      this.notification.error('Debe indicar el motivo de la anulación.');
      return;
    }
    this.guardando = true;
    const id = this.editando.idAnulacionSrv;
    const op = this.modoEdicion && id
      ? this.service.actualizar(id, this.editando)
      : this.service.crear(this.editando);
    op.subscribe({
      next: () => {
        this.cargar();
        this.cerrarModalForm();
        this.guardando = false;
        this.notification.success(this.modoEdicion ? 'Anulación actualizada.' : 'Trámite anulado.');
      },
      error: () => { this.guardando = false; this.notification.error('Error al guardar.'); }
    });
  }

  verDetalle(r: AnulacionTramite): void {
    this.detalle = r;
    this.detalleEntidadNombre = '';
    if (r.entidadId) {
      const ent = this.entidadesTransito.find(e => e.idEntidad === r.entidadId);
      this.detalleEntidadNombre = ent ? `${ent.codigo} - ${ent.nombre}` : '';
    }
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }
}
