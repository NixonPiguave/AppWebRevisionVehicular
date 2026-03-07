import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TraccionService, Traccion } from '../../../services/catalogos_vehiculos/traccion.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-traccion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './traccion.html',
  styleUrl: './traccion.css',
})
export class TraccionComponent implements OnInit {
  tracciones: Traccion[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  traccionEditando: Traccion = { id: null, tipo: '', descripcion: '', estado: 'A' };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  traccionDetalle: Traccion | null = null;

  constructor(
    private traccionService: TraccionService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarTracciones();
  }

  cargarTracciones(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.traccionService.listar().subscribe({
      next: (data) => {
        console.log('Tracciones cargadas:', data);
        this.tracciones = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tracciones:', err);
        this.error = 'Error al cargar las tracciones. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get traccionesFiltradas(): Traccion[] {
    if (!this.filtro.trim()) {
      return this.tracciones;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.tracciones.filter(
      (traccion) =>
        traccion.tipo.toLowerCase().includes(filtroLower) ||
        traccion.descripcion.toLowerCase().includes(filtroLower) ||
        (traccion.id?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(traccion.estado).toLowerCase().includes(filtroLower)
    );
  }

  get traccionesPaginadas(): Traccion[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.traccionesFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.traccionesFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.traccionEditando = { id: null, tipo: '', descripcion: '', estado: 'A' };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(traccion: Traccion): void {
    this.modoEdicion = true;
    this.traccionEditando = { ...traccion };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.traccionEditando = { id: null, tipo: '', descripcion: '', estado: 'A' };
  }

  guardarTraccion(): void {
    if (!this.traccionEditando.tipo.trim()) {
      this.notification.error('El tipo de tracción es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.traccionEditando.id) {
      // Editar existente
      this.traccionService.actualizar(this.traccionEditando.id, this.traccionEditando).subscribe({
        next: () => {
          this.cargarTracciones();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar tracción:', err);
          this.notification.error('Error al actualizar la tracción');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.traccionService.crear(this.traccionEditando).subscribe({
        next: () => {
          this.cargarTracciones();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear tracción:', err);
          this.notification.error('Error al crear la tracción');
          this.guardando = false;
        }
      });
    }
  }

  verDetalle(traccion: Traccion): void {
    this.traccionDetalle = traccion;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.traccionDetalle = null;
  }
}
