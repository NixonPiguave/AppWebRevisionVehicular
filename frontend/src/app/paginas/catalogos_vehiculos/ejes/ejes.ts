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
  // Datos principales
  ejes: Eje[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y Paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modales y Formulario
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  ejeEditando: Eje = this.inicializarEje();

  // Detalle
  mostrarModalDetalle: boolean = false;
  ejeDetalle: Eje | null = null;

  constructor(
    private ejesService: EjesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEjes();
  }

  private inicializarEje(): Eje {
    return { ejes_id: null, cantidad: null, descripcion: '', estado: 'A' };
  }

  cargarEjes(): void {
    this.cargando = true;
    this.error = '';
    this.ejesService.listarEjes().subscribe({
      next: (data) => {
        this.ejes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al conectar con el servidor de ejes.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Lógica de Tabla ---
  get ejesFiltradas(): Eje[] {
    if (!this.filtro.trim()) return this.ejes;
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

  // --- Navegación ---
  irAPagina(p: number): void { this.paginaActual = p; }
  onFiltroChange(): void { this.paginaActual = 1; }

  // --- Acciones Formulario ---
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.ejeEditando = this.inicializarEje();
    this.mostrarModalForm = true;
  }

  abrirModalEditar(eje: Eje): void {
    this.modoEdicion = true;
    this.ejeEditando = { ...eje };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarEje(): void {
    if (!this.ejeEditando.cantidad || this.ejeEditando.cantidad <= 0) {
      alert('La cantidad de ejes debe ser mayor a 0');
      return;
    }

    this.guardando = true;
    const peticion = (this.modoEdicion && this.ejeEditando.ejes_id)
      ? this.ejesService.actualizarEje(this.ejeEditando.ejes_id, this.ejeEditando)
      : this.ejesService.crearEje(this.ejeEditando);

    peticion.subscribe({
      next: () => {
        this.cargarEjes();
        this.cerrarModalForm();
        this.guardando = false;
      },
      error: () => {
        alert('Error al procesar la solicitud');
        this.guardando = false;
      }
    });
  }

  // --- Acciones Detalle ---
  verDetalle(eje: Eje): void {
    this.ejeDetalle = eje;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.ejeDetalle = null;
  }
}
