import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquiposService, Equipo } from '../../../services/inspeccion_rtv/equipos.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-equipos',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  // Lista de equipos (se carga desde el backend)
  equipos: Equipo[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  equipoEditando: Equipo = {
    equipoid: null,
    influencia: 0,
    ultimaCalibracion: null,
    ultimoMantenimiento: null,
    estado: 'A',
    codigoInterno: '',
    equipo: '',
    modelo: '',
    serialEquipo: ''
  };
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  equipoDetalle: Equipo | null = null;

  constructor(
    private equiposService: EquiposService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEquipos();
  }

  /**
   * Cargar equipos desde el backend
   */
  cargarEquipos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.equiposService.listarEquipos().subscribe({
      next: (data) => {
        console.log('Equipos cargados:', data);
        this.equipos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.error = 'Error al cargar los equipos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para equipos filtrados
  get equiposFiltrados(): Equipo[] {
    if (!this.filtro.trim()) {
      return this.equipos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.equipos.filter(
      (equipo) =>
        equipo.equipo.toLowerCase().includes(filtroLower) ||
        equipo.modelo.toLowerCase().includes(filtroLower) ||
        equipo.serialEquipo.toLowerCase().includes(filtroLower) ||
        equipo.codigoInterno.toLowerCase().includes(filtroLower)  ||
        this.getEstadoTexto(equipo.estado).toLowerCase().includes(filtroLower)
    );
  }

  // Getter para equipos paginados
  get equiposPaginados(): Equipo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.equiposFiltrados.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.equiposFiltrados.length / this.registrosPorPagina);
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

  // Formatear fecha para mostrar
  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'No registrada';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES');
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
    this.equipoEditando = {
      equipoid: null,
      influencia: 0,
      ultimaCalibracion: null,
      ultimoMantenimiento: null,
      estado: 'A',
      codigoInterno: '',
      equipo: '',
      modelo: '',
      serialEquipo: ''
    };
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(equipo: Equipo): void {
    this.modoEdicion = true;
    this.equipoEditando = { ...equipo };
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.equipoEditando = {
      equipoid: null,
      influencia: 0,
      ultimaCalibracion: null,
      ultimoMantenimiento: null,
      estado: 'A',
      codigoInterno: '',
      equipo: '',
      modelo: '',
      serialEquipo: ''
    };
  }

  // Guardar equipo (crear o editar)
  guardarEquipo(): void {
    // Validaciones
    if (!this.equipoEditando.equipo.trim()) {
      alert('El nombre del equipo es requerido');
      return;
    }
    if (!this.equipoEditando.modelo.trim()) {
      alert('El modelo es requerido');
      return;
    }
    if (!this.equipoEditando.serialEquipo.trim()) {
      alert('El número de serie es requerido');
      return;
    }
    if (!this.equipoEditando.codigoInterno.trim()) {
      alert('El código interno es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.equipoEditando.equipoid) {
      // Editar existente
      this.equiposService.actualizarEquipo(this.equipoEditando.equipoid, this.equipoEditando).subscribe({
        next: () => {
          this.cargarEquipos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar equipo:', err);
          alert('Error al actualizar el equipo');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.equiposService.crearEquipo(this.equipoEditando).subscribe({
        next: () => {
          this.cargarEquipos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear equipo:', err);
          alert('Error al crear el equipo');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(equipo: Equipo): void {
    this.equipoDetalle = equipo;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.equipoDetalle = null;
  }
}
