import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FamiliaService, Familia } from '../../../services/defectos_inspeccion/familia-defecto.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-familia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './familia-defecto.html',
  styleUrl: './familia-defecto.css',
})
export class FamiliaComponent implements OnInit {
  familias: Familia[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  familiaEditando: Familia = { id: null, nombre: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  familiaDetalle: Familia | null = null;

  constructor(private familiaService: FamiliaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarFamilias();
  }

  cargarFamilias(): void {
    this.cargando = true;
    this.familiaService.listarFamilias().subscribe({
      next: (data) => {
        this.familias = data;
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

  get familiasFiltradas(): Familia[] {
    const f = this.filtro.toLowerCase();
    return this.familias.filter(fam =>
      fam.nombre.toLowerCase().includes(f) ||
      fam.descripcion.toLowerCase().includes(f) ||
      (fam.id?.toString() || '').includes(f)
    );
  }

  get familiasPaginadas(): Familia[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.familiasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.familiasFiltradas.length / this.registrosPorPagina);
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
    this.familiaEditando = { id: null, nombre: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(familia: Familia): void {
    this.modoEdicion = true;
    this.familiaEditando = { ...familia };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarFamilia(): void {
    if (!this.familiaEditando.nombre.trim()) {
      alert('El nombre de la familia es obligatorio');
      return;
    }

    this.guardando = true;
    const idValue = this.familiaEditando.id;

    if (this.modoEdicion && idValue) {
      this.familiaService.actualizarFamilia(idValue, this.familiaEditando).subscribe({
        next: () => {
          this.cargarFamilias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al actualizar');
        }
      });
    } else {
      this.familiaService.crearFamilia(this.familiaEditando).subscribe({
        next: () => {
          this.cargarFamilias();
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

  verDetalle(familia: Familia): void {
    this.familiaDetalle = familia;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }
}
