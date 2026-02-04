import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EjesService, Eje } from '../../../services/catalogos_vehiculos/ejes.service';

@Component({
  selector: 'app-ejes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './ejes.html',
  styleUrl: './ejes.css',
})
export class EjesComponent implements OnInit {

  ejes: Eje[] = [];
  cargando = false;
  error = '';

  filtro = '';
  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  ejeEditando: Eje = this.inicializarEje();

  mostrarModalDetalle = false;
  ejeDetalle: Eje | null = null;

  constructor(
    private ejesService: EjesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEjes();
  }

  private inicializarEje(): Eje {
    return { id: null, cantidad: null, descripcion: '', estado: 'A' };
  }

  cargarEjes(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.ejesService.listarEjes().subscribe({
      next: data => {
        this.ejes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.error = 'Error al conectar con el servidor de ejes.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get ejesFiltradas(): Eje[] {
    const f = this.filtro.toLowerCase();
    return this.ejes.filter(e =>
      e.descripcion.toLowerCase().includes(f) ||
      e.cantidad?.toString().includes(f)
    );
  }

  get ejesPaginados(): Eje[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.ejesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.ejesFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void {
    this.paginaActual = p;
    this.cdr.detectChanges();
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.ejeEditando = this.inicializarEje();
    this.mostrarModalForm = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(eje: Eje): void {
    this.modoEdicion = true;
    this.ejeEditando = { ...eje };
    this.mostrarModalForm = true;
    this.cdr.detectChanges();
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.cdr.detectChanges();
  }

  guardarEje(): void {
    if (!this.ejeEditando.cantidad || this.ejeEditando.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const id = this.ejeEditando.id;

    const peticion = (this.modoEdicion && id)
      ? this.ejesService.actualizarEje(id, this.ejeEditando)
      : this.ejesService.crearEje(this.ejeEditando);

    peticion.subscribe({
      next: () => {
        this.cargarEjes();
        this.cerrarModalForm();
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Error al procesar la solicitud');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(eje: Eje): void {
    this.ejeDetalle = eje;
    this.mostrarModalDetalle = true;
    this.cdr.detectChanges();
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.ejeDetalle = null;
    this.cdr.detectChanges();
  }
}
