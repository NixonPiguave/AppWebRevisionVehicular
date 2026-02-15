import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TipoCombustibleService, TipoCombustible } from "../../../services/catalogos_vehiculos/tipo_combustible.service";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tipo-combustible',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './tipo-combustible.html',
  styleUrl: './tipo-combustible.css',
})
export class TipoCombustibleComponent implements OnInit {
  tipos: TipoCombustible[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  tipoEditando: TipoCombustible = { Id: null, nombre: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  tipoDetalle: TipoCombustible | null = null;

  constructor(private tipoService: TipoCombustibleService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargando = true;
    this.tipoService.listarTiposCombustible().subscribe({
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

  get tiposFiltrados(): TipoCombustible[] {
    const f = this.filtro.toLowerCase();
    return this.tipos.filter(t =>
      t.nombre.toLowerCase().includes(f) ||
      t.descripcion.toLowerCase().includes(f) ||
      (t.Id?.toString() || '').includes(f)
    );
  }

  get tiposPaginados(): TipoCombustible[] {
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
    this.tipoEditando = { Id: null, nombre: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(tipo: TipoCombustible): void {
    this.modoEdicion = true;
    this.tipoEditando = { ...tipo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarTipo(): void {
    if (!this.tipoEditando.nombre.trim()) {
      alert('El nombre del tipo de combustible es obligatorio');
      return;
    }

    this.guardando = true;
    const idValue = this.tipoEditando.Id;

    if (this.modoEdicion && idValue) {
      this.tipoService.actualizarTipoCombustible(idValue, this.tipoEditando).subscribe({
        next: () => {
          this.cargarTipos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al actualizar');
        }
      });
    } else {
      this.tipoService.crearTipoCombustible(this.tipoEditando).subscribe({
        next: () => {
          this.cargarTipos();
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

  verDetalle(tipo: TipoCombustible): void {
    this.tipoDetalle = tipo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
