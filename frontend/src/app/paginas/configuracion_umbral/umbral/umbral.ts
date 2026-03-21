import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import {
  UmbralService,
  Umbral,
  UnidadMedida,
  DescripcionUmbral
} from '../../../services/configuracion_umbral/umbral.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-umbral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './umbral.html',
  styleUrl: './umbral.css'
})
export class UmbralComponent implements OnInit {

  umbrales: Umbral[] = [];
  unidades: UnidadMedida[] = [];
  descripciones: DescripcionUmbral[] = [];

  cargando = false;
  error = '';
  filtro = '';

  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  umbralEditando: Umbral = {
    idUmbral: null,
    valorMin: 0,
    valorMax: 0,
    calificacion: 0,
    incValorMin: 0,
    incValorMax: 0,
    idUnidadMedida: 0,
    idDescripcionUmbral: 0,
    estado: 'A'
  };

  mostrarModalDetalle = false;
  umbralDetalle: Umbral | null = null;

  constructor(
    private umbralService: UmbralService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.umbralService.listarUnidades().subscribe({
      next: (unidades) => {
        this.unidades = unidades.filter(u => u.estado === 'A');

        this.umbralService.listarDescripciones().subscribe({
          next: (descripciones) => {
            this.descripciones = descripciones.filter(d => d.estado === 'A');

            this.umbralService.listar().subscribe({
              next: (umbrales) => {
                this.umbrales = umbrales.map(u => ({
                  ...u,
                  nombreUnidad: this.obtenerNombreUnidad(u.idUnidadMedida),
                  nombreDescripcion: this.obtenerNombreDescripcion(u.idDescripcionUmbral)
                }));
                this.cargando = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.error = 'Error al cargar los umbrales';
                this.cargando = false;
              }
            });

          },
          error: () => {
            this.error = 'Error al cargar las descripciones';
            this.cargando = false;
          }
        });

      },
      error: () => {
        this.error = 'Error al cargar las unidades';
        this.cargando = false;
      }
    });
  }

  obtenerNombreUnidad(id: number): string {
    const unidad = this.unidades.find(u => u.idUnidadMedida === id);
    return unidad ? unidad.nombre : 'Sin unidad';
  }

  obtenerNombreDescripcion(id: number): string {
    const desc = this.descripciones.find(d => d.idDescripcionUmbral === id);
    return desc ? desc.descripcion : 'Sin descripción';
  }

  get umbralesFiltrados(): Umbral[] {
    if (!this.filtro.trim()) return this.umbrales;

    const f = this.filtro.toLowerCase();
    return this.umbrales.filter(u =>
      u.valorMin.toString().includes(f) ||
      u.valorMax.toString().includes(f) ||
      u.calificacion.toString().includes(f) ||
      (u.nombreUnidad || '').toLowerCase().includes(f) ||
      (u.nombreDescripcion || '').toLowerCase().includes(f) ||
      this.getEstadoTexto(u.estado).toLowerCase().includes(f)
    );
  }

  get umbralesPaginados(): Umbral[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.umbralesFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.umbralesFiltrados.length / this.registrosPorPagina) || 1;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.umbralEditando = {
      idUmbral: null,
      valorMin: 0,
      valorMax: 0,
      calificacion: 0,
      incValorMin: 0,
      incValorMax: 0,
      idUnidadMedida: this.unidades.length ? this.unidades[0].idUnidadMedida : 0,
      idDescripcionUmbral: this.descripciones.length ? this.descripciones[0].idDescripcionUmbral : 0,
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(umbral: Umbral): void {
    this.modoEdicion = true;
    this.umbralEditando = { ...umbral };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardar(): void {

    if (this.umbralEditando.valorMin >= this.umbralEditando.valorMax) {
      this.notification.error('El valor mínimo debe ser menor al valor máximo');
      return;
    }

    if (!this.umbralEditando.idUnidadMedida) {
      this.notification.error('Debe seleccionar una unidad de medida');
      return;
    }

    if (!this.umbralEditando.idDescripcionUmbral) {
      this.notification.error('Debe seleccionar una descripción');
      return;
    }
    if (this.umbralEditando.valorMin < 0 || this.umbralEditando.valorMax < 0) {
      this.notification.error('Los valores MIN y MAX no pueden ser negativos');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.umbralEditando.idUmbral) {

      this.umbralService.actualizar(
        this.umbralEditando.idUmbral,
        this.umbralEditando
      ).subscribe({
        next: () => {
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          this.notification.error('Error al actualizar');
          this.guardando = false;
        }
      });

    } else {

      const nuevo: Umbral = {
        idUmbral: null,
        valorMin: this.umbralEditando.valorMin,
        valorMax: this.umbralEditando.valorMax,
        calificacion: this.umbralEditando.calificacion,
        incValorMin: this.umbralEditando.incValorMin,
        incValorMax: this.umbralEditando.incValorMax,
        idUnidadMedida: this.umbralEditando.idUnidadMedida,
        idDescripcionUmbral: this.umbralEditando.idDescripcionUmbral,
        estado: this.umbralEditando.estado
      };

      this.umbralService.crear(nuevo).subscribe({
        next: () => {
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          this.notification.error('Error al crear');
          this.guardando = false;
        }
      });
    }
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este umbral?')) return;

    this.umbralService.eliminar(id).subscribe({
      next: () => this.cargarDatos(),
      error: () => this.notification.error('Error al eliminar')
    });
  }

  verDetalle(umbral: Umbral): void {
    this.umbralDetalle = umbral;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.umbralDetalle = null;
  }
}
