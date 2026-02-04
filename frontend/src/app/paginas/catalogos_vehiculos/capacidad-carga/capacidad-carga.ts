import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CapacidadCargaService, CapacidadCarga } from '../../../services/catalogos_vehiculos/capacidad_carga.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-capacidad-carga',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './capacidad-carga.html',
  styleUrl: './capacidad-carga.css',
})
export class CapacidadCargaComponent implements OnInit {
  capacidades: CapacidadCarga[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  guardando: boolean = false;

  // Inicializamos usando 'id'
  capacidadEditando: CapacidadCarga = { id: null, capacidad: '', descripcion: '', estado: 'A', unidad: '' };

  mostrarModalDetalle: boolean = false;
  capacidadDetalle: CapacidadCarga | null = null;

  constructor(private capacidadService: CapacidadCargaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarCapacidades();
  }

  cargarCapacidades(): void {
    this.cargando = true;
    this.capacidadService.listarCapacidadesCarga().subscribe({
      next: (data) => {
        this.capacidades = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar capacidades.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get capacidadesFiltradas(): CapacidadCarga[] {
    const f = this.filtro.toLowerCase();
    return this.capacidades.filter(c =>
      c.capacidad.toString().includes(f) ||
      c.descripcion.toLowerCase().includes(f) ||
      c.id?.toString().includes(f)
    );
  }

  get capacidadesPaginadas(): CapacidadCarga[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.capacidadesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.capacidadesFiltradas.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }

  getEstadoTexto(estado: string): string { return estado === 'A' ? 'Activo' : 'Inactivo'; }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.capacidadEditando = { id: null, capacidad: '', descripcion: '', estado: 'A', unidad: '' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(capacidad: CapacidadCarga): void {
    this.modoEdicion = true;
    this.capacidadEditando = { ...capacidad }; // Aquí se copia el 'id' del backend
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardarCapacidad(): void {
    if (!this.capacidadEditando.capacidad) return;
    this.guardando = true;

    // USAMOS 'id'
    const idValue = this.capacidadEditando.id;

    if (this.modoEdicion && idValue !== null) {
      this.capacidadService.actualizarCapacidadCarga(idValue, this.capacidadEditando).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => { this.guardando = false; alert('Error al actualizar'); }
      });
    } else {
      this.capacidadService.crearCapacidadCarga(this.capacidadEditando).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => { this.guardando = false; alert('Error al crear'); }
      });
    }
  }

  verDetalle(capacidad: CapacidadCarga): void {
    this.capacidadDetalle = capacidad;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }
}
