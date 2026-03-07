import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TipoMatriculaService, TipoMatricula } from '../../../services/catalogos_vehiculos/tipo_matricula.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-tipo-matricula',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './tipo-matricula.html',
  styleUrl: './tipo-matricula.css',
})
export class TipoMatriculaComponent implements OnInit {
  tipos: TipoMatricula[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  tipoEditando: TipoMatricula = { id: null, nombre: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  tipoDetalle: TipoMatricula | null = null;

  constructor(
    private tipoService: TipoMatriculaService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargando = true;
    this.tipoService.listarTiposMatricula().subscribe({
      next: (data) => {
        this.tipos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar datos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get tiposFiltrados(): TipoMatricula[] {
    const f = this.filtro.toLowerCase();
    return this.tipos.filter(t =>
      t.nombre.toLowerCase().includes(f) ||
      t.descripcion.toLowerCase().includes(f) ||
      (t.id?.toString() || '').includes(f)
    );
  }

  get tiposPaginados(): TipoMatricula[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.tiposFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.tiposFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void {
    this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.tipoEditando = { id: null, nombre: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(tipo: TipoMatricula): void {
    this.modoEdicion = true;
    this.tipoEditando = { ...tipo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarTipo(): void {
    if (!this.tipoEditando.nombre.trim()) {
      this.notification.error('El nombre del tipo de matrícula es obligatorio');
      return;
    }

    this.guardando = true;
    const idValue = this.tipoEditando.id;

    if (this.modoEdicion && idValue) {
      this.tipoService.actualizarTipoMatricula(idValue, this.tipoEditando).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          this.notification.error('Error al actualizar');
        }
      });
    } else {
      this.tipoService.crearTipoMatricula(this.tipoEditando).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          this.notification.error('Error al crear');
        }
      });
    }
  }

  verDetalle(tipo: TipoMatricula): void {
    this.tipoDetalle = tipo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
