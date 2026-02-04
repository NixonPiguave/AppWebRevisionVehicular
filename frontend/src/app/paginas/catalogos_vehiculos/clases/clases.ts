import { Component, OnInit } from '@angular/core';
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
  cargando = false;
  error = '';
  filtro = '';

  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  claseEditando: Clase = {
    id: null,
    clase: '',
    descripcion: '',
    estado: 'A'
  };

  mostrarModalDetalle = false;
  claseDetalle: Clase | null = null;

  constructor(private clasesService: ClasesService) {}

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.cargando = true;
    this.error = '';

    this.clasesService.listarClases().subscribe({
      next: data => {
        this.clases = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las clases.';
        this.cargando = false;
      }
    });
  }

  get clasesFiltradas(): Clase[] {
    const f = this.filtro.toLowerCase();
    return this.clases.filter(c =>
      c.clase.toLowerCase().includes(f) ||
      c.descripcion.toLowerCase().includes(f) ||
      c.id?.toString().includes(f)
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

  irAPagina(p: number): void {
    this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.claseEditando = {
      id: null,
      clase: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(clase: Clase): void {
    this.modoEdicion = true;
    this.claseEditando = { ...clase };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarClase(): void {
    if (!this.claseEditando.clase.trim()) return;

    this.guardando = true;
    const id = this.claseEditando.id;

    if (this.modoEdicion && id) {
      this.clasesService.actualizarClase(id, this.claseEditando).subscribe({
        next: () => {
          this.cargarClases();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          alert('Error al actualizar la clase');
          this.guardando = false;
        }
      });
    } else {
      this.clasesService.crearClase(this.claseEditando).subscribe({
        next: () => {
          this.cargarClases();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          alert('Error al crear la clase');
          this.guardando = false;
        }
      });
    }
  }

  verDetalle(clase: Clase): void {
    this.claseDetalle = clase;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
