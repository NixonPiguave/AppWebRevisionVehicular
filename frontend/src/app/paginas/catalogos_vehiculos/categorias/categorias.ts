import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CategoriasService, Categoria } from '../../../services/catalogos_vehiculos/categorias.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando: boolean = false;
  error: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  categoriaEditando: Categoria = { codigo: '', nombre: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  categoriaDetalle: Categoria | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.error = '';
    this.categoriasService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar las categorías.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get categoriasFiltradas(): Categoria[] {
    const f = this.filtro.toLowerCase().trim();
    if (!f) return this.categorias;
    return this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(f) ||
      c.codigo.toLowerCase().includes(f) ||
      c.descripcion.toLowerCase().includes(f)
    );
  }

  get categoriasPaginadas(): Categoria[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.categoriasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({length: this.totalPaginas}, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void { this.paginaActual = p; }

  onFiltroChange(): void { this.paginaActual = 1; }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.categoriaEditando = { codigo: '', nombre: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(categoria: Categoria): void {
    this.modoEdicion = true;
    this.categoriaEditando = { ...categoria };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardarCategoria(): void {
    if (!this.categoriaEditando.nombre || !this.categoriaEditando.codigo) {
      alert('Nombre y Código son obligatorios');
      return;
    }
    this.guardando = true;
    const observer = {
      next: () => {
        this.cargarCategorias();
        this.cerrarModalForm();
        this.guardando = false;
      },
      error: () => {
        alert('Error al guardar');
        this.guardando = false;
      }
    };

    if (this.modoEdicion && this.categoriaEditando.categoriaid) {
      this.categoriasService.actualizarCategoria(this.categoriaEditando.categoriaid, this.categoriaEditando).subscribe(observer);
    } else {
      this.categoriasService.crearCategoria(this.categoriaEditando).subscribe(observer);
    }
  }
// Agrega esto en tu CategoriasComponent si no lo tienes
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.categoriaDetalle = null;
  }
  verDetalle(categoria: Categoria): void {
    this.categoriaDetalle = categoria;
    this.mostrarModalDetalle = true;
  }
}
