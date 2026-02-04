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
  // Lista de ámbitos operacionales
  ambitos: AmbitoOperacional[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  ambitoEditando: AmbitoOperacional = { ambitoOperacionalId: null, ambito: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  ambitoDetalle: AmbitoOperacional | null = null;

  constructor(
    private ambitoService: AmbitoOperacionalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAmbitos();
  }

  /** Cargar ámbitos operacionales desde el backend */
  cargarAmbitos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.ambitoService.listarAmbitosOperacionales().subscribe({
      next: (data) => {
        console.log('Ámbitos operacionales cargados:', data);
        this.ambitos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ámbitos operacionales:', err);
        this.error = 'Error al cargar los ámbitos operacionales. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para ámbitos filtrados
  get ambitosFiltrados(): AmbitoOperacional[] {
    if (!this.filtro.trim()) {
      return this.ambitos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.ambitos.filter(
      (ambito) =>
        ambito.ambito.toLowerCase().includes(filtroLower) ||
        ambito.descripcion.toLowerCase().includes(filtroLower) ||
        (ambito.ambitoOperacionalId?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(ambito.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para ámbitos paginados
  get ambitosPaginados(): AmbitoOperacional[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.ambitosFiltrados.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.ambitosFiltrados.length / this.registrosPorPagina);
  }

  // Getter para array de páginas
  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Convertir estado a texto
  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  // Cambiar página
  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Reset página al cambiar filtro o registros por página
  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  // Abrir modal para crear
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.ambitoEditando = { ambitoOperacionalId: null, ambito: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(ambito: AmbitoOperacional): void {
    this.modoEdicion = true;
    this.ambitoEditando = { ...ambito };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.ambitoEditando = { ambitoOperacionalId: null, ambito: '', descripcion: '', estado: 'A' };
  }

  // Guardar ámbito (crear o editar)
  guardarAmbito(): void {
    if (!this.ambitoEditando.ambito.trim()) {
      alert('El nombre del ámbito operacional es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.ambitoEditando.ambitoOperacionalId) {
      // Editar existente
      this.ambitoService.actualizarAmbitoOperacional(this.ambitoEditando.ambitoOperacionalId, this.ambitoEditando).subscribe({
        next: () => {
          this.cargarAmbitos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar ámbito operacional:', err);
          alert('Error al actualizar el ámbito operacional');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.ambitoService.crearAmbitoOperacional(this.ambitoEditando).subscribe({
        next: () => {
          this.cargarAmbitos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear ámbito operacional:', err);
          alert('Error al crear el ámbito operacional');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(ambito: AmbitoOperacional): void {
    this.ambitoDetalle = ambito;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.ambitoDetalle = null;
  }
}
