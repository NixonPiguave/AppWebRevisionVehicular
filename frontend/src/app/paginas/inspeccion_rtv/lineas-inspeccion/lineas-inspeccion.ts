import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LineasService, Linea } from '../../../services/inspeccion_rtv/lineas.service';

@Component({
  selector: 'app-lineas',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './lineas.html',
  styleUrl: './lineas.css',
})
export class LineasComponent implements OnInit {

  lineas: Linea[] = [];
  cargando = false;
  error = '';

  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  lineaEditando: Linea = {
    lineaId: null,
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando = false;

  mostrarModalDetalle = false;
  lineaDetalle: Linea | null = null;

  constructor(
    private lineasService: LineasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLineas();
  }

  cargarLineas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.lineasService.listarLineas().subscribe({
      next: (data) => {
        this.lineas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar las líneas';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get lineasFiltradas(): Linea[] {
    if (!this.filtro.trim()) return this.lineas;
    const f = this.filtro.toLowerCase();
    return this.lineas.filter(l =>
      l.nombre.toLowerCase().includes(f) ||
      l.descripcion.toLowerCase().includes(f) ||
      (l.lineaId?.toString() || '').includes(f)
    );
  }

  get lineasPaginadas(): Linea[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.lineasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.lineasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.lineaEditando = { lineaId: null, nombre: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(linea: Linea): void {
    this.modoEdicion = true;
    this.lineaEditando = { ...linea };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarLinea(): void {
    if (!this.lineaEditando.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.lineaEditando.lineaId) {
      this.lineasService.actualizarLinea(this.lineaEditando.lineaId, this.lineaEditando)
        .subscribe(() => {
          this.cargarLineas();
          this.cerrarModalForm();
          this.guardando = false;
        });
    } else {
      this.lineasService.crearLinea(this.lineaEditando)
        .subscribe(() => {
          this.cargarLineas();
          this.cerrarModalForm();
          this.guardando = false;
        });
    }
  }

  verDetalle(linea: Linea): void {
    this.lineaDetalle = linea;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.lineaDetalle = null;
  }
}
