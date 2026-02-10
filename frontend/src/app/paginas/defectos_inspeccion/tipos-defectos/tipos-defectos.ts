import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TiposDefectosService, TipoDefecto } from '../../../services/defectos_inspeccion/tipos_defectos.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tipos-defectos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './tipos-defectos.html',
  styleUrl: './tipos-defectos.css',
})
export class TiposDefectosComponent implements OnInit {
  tiposDefectos: TipoDefecto[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  tipoDefectoEditando: TipoDefecto = {
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'A'
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  tipoDefectoDetalle: TipoDefecto | null = null;

  constructor(
    private tiposDefectosService: TiposDefectosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTiposDefectos();
  }

  cargarTiposDefectos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tiposDefectosService.listar().subscribe({
      next: (data) => {
        console.log('Tipos de defectos cargados:', data);
        this.tiposDefectos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de defectos:', err);
        this.error = 'Error al cargar los tipos de defectos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get tiposDefectosFiltrados(): TipoDefecto[] {
    if (!this.filtro.trim()) {
      return this.tiposDefectos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.tiposDefectos.filter(
      (tipo) =>
        tipo.codigo.toLowerCase().includes(filtroLower) ||
        tipo.nombre.toLowerCase().includes(filtroLower) ||
        tipo.descripcion.toLowerCase().includes(filtroLower) ||
        (tipo.id?.toString() || '').includes(filtroLower) ||
        this.getEstadoTexto(tipo.estado).toLowerCase().includes(filtroLower)
    );
  }

  get tiposDefectosPaginados(): TipoDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.tiposDefectosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.tiposDefectosFiltrados.length / this.registrosPorPagina);
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
    this.tipoDefectoEditando = {
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(tipoDefecto: TipoDefecto): void {
    this.modoEdicion = true;
    this.tipoDefectoEditando = { ...tipoDefecto };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.tipoDefectoEditando = {
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }

  guardarTipoDefecto(): void {
    // Validación simple: solo nombre es requerido
    if (!this.tipoDefectoEditando.nombre.trim()) {
      alert('El nombre del tipo de defecto es requerido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.tipoDefectoEditando.id) {
      // Editar existente
      this.tiposDefectosService.actualizar(
        this.tipoDefectoEditando.id,
        this.tipoDefectoEditando
      ).subscribe({
        next: () => {
          this.cargarTiposDefectos();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar tipo de defecto:', err);
          alert('Error al actualizar el tipo de defecto');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo - NO ENVIAR EL ID
      const nuevoTipoDefecto = {
        codigo: this.tipoDefectoEditando.codigo,
        nombre: this.tipoDefectoEditando.nombre,
        descripcion: this.tipoDefectoEditando.descripcion,
        estado: this.tipoDefectoEditando.estado
      };

      this.tiposDefectosService.crear(nuevoTipoDefecto as TipoDefecto).subscribe({
        next: (response) => {
          console.log('Tipo de defecto creado:', response);
          // Forzar recarga completa
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarTiposDefectos();
        },
        error: (err) => {
          console.error('Error al crear tipo de defecto:', err);
          alert('Error al crear el tipo de defecto');
          this.guardando = false;
        }
      });
    }
  }

  verDetalle(tipoDefecto: TipoDefecto): void {
    this.tipoDefectoDetalle = tipoDefecto;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.tipoDefectoDetalle = null;
  }
}
