import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnidadMedidaService, UnidadMedida } from '../../../services/configuracion_umbral/unidad-medida.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-unidad-medida',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './unidades-medida.html',
  styleUrl: './unidades-medida.css',
})
export class UnidadMedidaComponent implements OnInit {
  unidades: UnidadMedida[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  unidadEditando: UnidadMedida = {
    idUnidadMedida: null,
    nombre: '',
    simbolo: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  unidadDetalle: UnidadMedida | null = null;

  constructor(
    private unidadService: UnidadMedidaService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarUnidades();
  }

  cargarUnidades(): void {
    this.cargando = true;
    this.unidadService.listarUnidadesMedida().subscribe({
      next: (data) => {
        this.unidades = data;
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

  get unidadesFiltradas(): UnidadMedida[] {
    const f = this.filtro.toLowerCase();
    return this.unidades.filter(u =>
      u.nombre.toLowerCase().includes(f) ||
      u.simbolo.toLowerCase().includes(f) ||
      u.descripcion.toLowerCase().includes(f) ||
      (u.idUnidadMedida?.toString() || '').includes(f)
    );
  }

  get unidadesPaginadas(): UnidadMedida[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.unidadesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.unidadesFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({length: this.totalPaginas}, (_, i) => i + 1);
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
    this.unidadEditando = {
      idUnidadMedida: null,
      nombre: '',
      simbolo: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(unidad: UnidadMedida): void {
    this.modoEdicion = true;
    this.unidadEditando = {...unidad};
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarUnidad(): void {
    if (!this.unidadEditando.nombre.trim()) {
      this.notification.error('El nombre de la unidad de medida es obligatorio');
      return;
    }

    if (!this.unidadEditando.simbolo.trim()) {
      this.notification.error('El símbolo es obligatorio');
      return;
    }

    this.guardando = true;
    const idValue = this.unidadEditando.idUnidadMedida;

    if (this.modoEdicion && idValue) {
      this.unidadService.actualizarUnidadMedida(idValue, this.unidadEditando).subscribe({
        next: () => {
          this.cargarUnidades();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          this.notification.error('Error al actualizar');
        }
      });
    } else {
      this.unidadService.crearUnidadMedida(this.unidadEditando).subscribe({
        next: () => {
          this.cargarUnidades();
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

  verDetalle(unidad: UnidadMedida): void {
    this.unidadDetalle = unidad;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
