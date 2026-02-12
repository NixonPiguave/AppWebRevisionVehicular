import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModeloService, Modelo, Marca } from '../../../services/catalogos_vehiculos/modelos.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './modelos.html',
  styleUrl: './modelos.css',
})
export class ModelosComponent implements OnInit {
  modelos: Modelo[] = [];
  marcas: Marca[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  modeloEditando: Modelo = {
    id: 0,
    nombre: '',
    anioDesde: new Date().getFullYear(),
    anioHasta: new Date().getFullYear(),
    estado: 'A',
    marcaId: 0
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  modeloDetalle: Modelo | null = null;

  constructor(
    private modeloService: ModeloService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /** Cargar modelos y marcas */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Cargar marcas primero
    this.modeloService.listarMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas.filter(m => m.estado === 'A'); // Solo activas

        // Luego cargar modelos
        this.modeloService.listar().subscribe({
          next: (modelos) => {
            console.log('Modelos cargados:', modelos);
            // Enriquecer modelos con nombre de marca
            this.modelos = modelos.map(modelo => ({
              ...modelo,
              marcaNombre: this.obtenerNombreMarca(modelo.marcaId)
            }));
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar modelos:', err);
            this.error = 'Error al cargar los modelos. Verifica que el backend esté corriendo.';
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar marcas:', err);
        this.error = 'Error al cargar las marcas. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Obtener nombre de marca por ID */
  obtenerNombreMarca(marcaId: number): string {
    const marca = this.marcas.find(m => m.id === marcaId);
    return marca ? marca.nombre : 'Sin marca';
  }

  /** Filtrar modelos */
  get modelosFiltrados(): Modelo[] {
    if (!this.filtro.trim()) {
      return this.modelos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.modelos.filter(
      (modelo) =>
        modelo.nombre.toLowerCase().includes(filtroLower) ||
        (modelo.marcaNombre || '').toLowerCase().includes(filtroLower) ||
        modelo.anioDesde.toString().includes(filtroLower) ||
        modelo.anioHasta.toString().includes(filtroLower) ||
        this.getEstadoTexto(modelo.estado).toLowerCase().includes(filtroLower)
    );
  }

  /** Modelos paginados */
  get modelosPaginados(): Modelo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.modelosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.modelosFiltrados.length / this.registrosPorPagina);
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

  /** Abrir modal crear */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.modeloEditando = {
      id: 0,
      nombre: '',
      anioDesde: new Date().getFullYear(),
      anioHasta: new Date().getFullYear(),
      estado: 'A',
      marcaId: this.marcas.length > 0 ? this.marcas[0].id || 0 : 0
    };
    this.mostrarModalForm = true;
  }

  /** Abrir modal editar */
  abrirModalEditar(modelo: Modelo): void {
    this.modoEdicion = true;
    this.modeloEditando = { ...modelo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  /** Guardar modelo */
  guardarModelo(): void {
    // Validaciones
    if (!this.modeloEditando.nombre.trim()) {
      alert('El nombre del modelo es requerido');
      return;
    }
    if (!this.modeloEditando.marcaId || this.modeloEditando.marcaId === 0) {
      alert('Debe seleccionar una marca');
      return;
    }
    if (this.modeloEditando.anioDesde > this.modeloEditando.anioHasta) {
      alert('El año desde no puede ser mayor que el año hasta');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.modeloEditando.id) {
      // Editar
      this.modeloService.actualizar(this.modeloEditando.id, this.modeloEditando).subscribe({
        next: (response) => {
          console.log('Modelo actualizado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al actualizar modelo:', err);
          alert('Error al actualizar el modelo');
          this.guardando = false;
        }
      });
    } else {
      // Crear (sin enviar ID)
      const nuevoModelo = {
        nombre: this.modeloEditando.nombre,
        anioDesde: this.modeloEditando.anioDesde,
        anioHasta: this.modeloEditando.anioHasta,
        estado: this.modeloEditando.estado,
        marcaId: this.modeloEditando.marcaId
      };

      this.modeloService.crear(nuevoModelo as Modelo).subscribe({
        next: (response) => {
          console.log('Modelo creado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al crear modelo:', err);
          alert('Error al crear el modelo');
          this.guardando = false;
        }
      });
    }
  }

  /** Ver detalle */
  verDetalle(modelo: Modelo): void {
    this.modeloDetalle = modelo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.modeloDetalle = null;
  }
}
