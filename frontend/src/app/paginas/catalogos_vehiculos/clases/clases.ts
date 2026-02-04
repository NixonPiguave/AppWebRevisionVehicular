import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ClasesService, Clase } from '../../../services/catalogos_vehiculos/clases.service';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './clases.html',
  styleUrl: './clases.css',
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  cargando: boolean = false;
  error: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  claseEditando: Clase = { clase_id: null, codigo: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  claseDetalle: Clase | null = null;

  constructor(
    private clasesService: ClasesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.cargando = true;
    this.error = '';
    this.clasesService.listarClases().subscribe({
      next: (data) => {
        this.clases = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar las clases.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get clasesFiltradas(): Clase[] {
    if (!this.filtro.trim()) return this.clases;
    const f = this.filtro.toLowerCase();
    return this.clases.filter(c =>
      c.codigo.toLowerCase().includes(f) ||
      c.descripcion.toLowerCase().includes(f)
    );
  }

  get clasesPaginadas(): Clase[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.clasesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.clasesFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void { this.paginaActual = p; }

  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.claseEditando = { clase_id: null, codigo: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(clase: Clase): void {
    this.modoEdicion = true;
    this.claseEditando = { ...clase };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardarClase(): void {
    if (!this.claseEditando.codigo.trim() || !this.claseEditando.descripcion.trim()) {
      alert('Código y descripción son requeridos');
      return;
    }
    this.guardando = true;
    const peticion = (this.modoEdicion && this.claseEditando.clase_id)
      ? this.clasesService.actualizarClase(this.claseEditando.clase_id, this.claseEditando)
      : this.clasesService.crearClase(this.claseEditando);

    peticion.subscribe({
      next: () => {
        this.cargarClases();
        this.cerrarModalForm();
        this.guardando = false;
      },
      error: () => {
        alert('Error al guardar la clase');
        this.guardando = false;
      }
    });
  }

  verDetalle(clase: Clase): void {
    this.claseDetalle = clase;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.claseDetalle = null;
  }
}
