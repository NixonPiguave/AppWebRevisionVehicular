import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  DescripcionUmbralService,
  DescripcionUmbral
} from '../../../services/configuracion_umbral/descripcion.service';

@Component({
  selector: 'app-descripcion-umbral',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './descripcion-umbral.html',
  styleUrl: './descripcion-umbral.css',
})
export class DescripcionUmbralComponent implements OnInit {

  descripciones: DescripcionUmbral[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  descripcionEditando: DescripcionUmbral = {
    idDescripcionUmbral: null,
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  descripcionDetalle: DescripcionUmbral | null = null;

  constructor(
    private descripcionService: DescripcionUmbralService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDescripciones();
  }

  cargarDescripciones(): void {
    this.cargando = true;
    this.descripcionService.listarDescripcionUmbral().subscribe({
      next: (data) => {
        this.descripciones = data;
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

  get descripcionesFiltradas(): DescripcionUmbral[] {
    const f = this.filtro.toLowerCase();
    return this.descripciones.filter(d =>
      d.descripcion.toLowerCase().includes(f) ||
      (d.idDescripcionUmbral?.toString() || '').includes(f)
    );
  }

  get descripcionesPaginadas(): DescripcionUmbral[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.descripcionesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.descripcionesFiltradas.length / this.registrosPorPagina);
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
    this.descripcionEditando = {
      idDescripcionUmbral: null,
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(descripcion: DescripcionUmbral): void {
    this.modoEdicion = true;
    this.descripcionEditando = { ...descripcion };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarDescripcion(): void {
    if (!this.descripcionEditando.descripcion.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    this.guardando = true;
    const idValue = this.descripcionEditando.idDescripcionUmbral;

    if (this.modoEdicion && idValue) {
      this.descripcionService
        .actualizarDescripcionUmbral(idValue, this.descripcionEditando)
        .subscribe({
          next: () => {
            this.cargarDescripciones();
            this.cerrarModalForm();
            this.guardando = false;
          },
          error: () => {
            this.guardando = false;
            alert('Error al actualizar');
          }
        });
    } else {
      this.descripcionService
        .crearDescripcionUmbral(this.descripcionEditando)
        .subscribe({
          next: () => {
            this.cargarDescripciones();
            this.cerrarModalForm();
            this.guardando = false;
          },
          error: () => {
            this.guardando = false;
            alert('Error al crear');
          }
        });
    }
  }

  eliminarDescripcion(descripcion: DescripcionUmbral): void {
    if (!descripcion.idDescripcionUmbral) return;

    if (confirm('¿Está seguro de eliminar esta descripción?')) {
      this.descripcionService
        .eliminarDescripcionUmbral(descripcion.idDescripcionUmbral)
        .subscribe({
          next: () => {
            this.cargarDescripciones();
          },
          error: () => {
            alert('Error al eliminar');
          }
        });
    }
  }

  verDetalle(descripcion: DescripcionUmbral): void {
    this.descripcionDetalle = descripcion;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
