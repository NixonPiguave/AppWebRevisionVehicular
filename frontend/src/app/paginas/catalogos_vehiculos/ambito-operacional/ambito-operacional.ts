import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AmbitoOperacionalService, AmbitoOperacional } from '../../../services/catalogos_vehiculos/ambito_operacional.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ambito-operacional',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './ambito-operacional.html',
  styleUrl: './ambito-operacional.css',
})
export class AmbitoOperacionalComponent implements OnInit {
  ambitos: AmbitoOperacional[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  ambitoEditando: AmbitoOperacional = { id: null, ambito: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  ambitoDetalle: AmbitoOperacional | null = null;

  constructor(private ambitoService: AmbitoOperacionalService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.cargarAmbitos(); }

  cargarAmbitos(): void {
    this.cargando = true;
    this.ambitoService.listarAmbitosOperacionales().subscribe({
      next: (data) => {
        this.ambitos = data;
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

  get ambitosFiltrados(): AmbitoOperacional[] {
    const f = this.filtro.toLowerCase();
    return this.ambitos.filter(a =>
      a.ambito.toLowerCase().includes(f) ||
      a.descripcion.toLowerCase().includes(f) ||
      (a.id?.toString() || '').includes(f)
    );
  }

  get ambitosPaginados(): AmbitoOperacional[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.ambitosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number { return Math.ceil(this.ambitosFiltrados.length / this.registrosPorPagina); }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }

  getEstadoTexto(estado: string): string { return estado === 'A' ? 'Activo' : 'Inactivo'; }
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.ambitoEditando = { id: null, ambito: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(ambito: AmbitoOperacional): void {
    this.modoEdicion = true;
    this.ambitoEditando = { ...ambito };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardarAmbito(): void {
    if (!this.ambitoEditando.ambito.trim()) return;
    this.guardando = true;

    const idValue = this.ambitoEditando.id;

    if (this.modoEdicion && idValue) {
      this.ambitoService.actualizarAmbitoOperacional(idValue, this.ambitoEditando).subscribe({
        next: () => {
          this.cargarAmbitos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => { this.guardando = false; alert('Error al actualizar'); }
      });
    } else {
      this.ambitoService.crearAmbitoOperacional(this.ambitoEditando).subscribe({
        next: () => {
          this.cargarAmbitos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => { this.guardando = false; alert('Error al crear'); }
      });
    }
  }

  verDetalle(ambito: AmbitoOperacional): void {
    this.ambitoDetalle = ambito;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void { this.mostrarModalDetalle = false; }
}
