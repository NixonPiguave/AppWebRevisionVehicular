import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TipoVehiculoService, TipoVehiculo, Clase } from '../../../services/catalogos_vehiculos/tipo_vehiculo.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-tipo-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './tipo-vehiculo.html',
  styleUrl: './tipo-vehiculo.css',
})
export class TipoVehiculoComponent implements OnInit {
  tiposVehiculos: TipoVehiculo[] = [];
  clases: Clase[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  tipoVehiculoEditando: TipoVehiculo = {
    id: null,
    nombre: '',
    descripcion: '',
    estado: 'A',
    claseId: 0,
    claseNombre: ''
  };
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  tipoVehiculoDetalle: TipoVehiculo | null = null;

  constructor(
    private tipoVehiculoService: TipoVehiculoService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /** Cargar tipos de vehículos y clases */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Cargar clases primero
    this.tipoVehiculoService.listarClases().subscribe({
      next: (clases) => {
        this.clases = clases.filter(c => c.estado === 'A'); // Solo activas

        // Luego cargar tipos de vehículos
        this.tipoVehiculoService.listar().subscribe({
          next: (tipos) => {
            console.log('Tipos de vehículos cargados:', tipos);
            // Enriquecer tipos con nombre de clase
            this.tiposVehiculos = tipos.map(tipo => ({
              ...tipo,
              claseNombre: this.obtenerNombreClase(tipo.claseId)
            }));
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar tipos de vehículos:', err);
            this.error = 'Error al cargar los tipos de vehículos. Verifica que el backend esté corriendo.';
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar clases:', err);
        this.error = 'Error al cargar las clases. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Obtener nombre de clase por ID */
  obtenerNombreClase(claseId: number): string {
    const clase = this.clases.find(c => c.id === claseId);
    return clase ? clase.clase : 'Sin clase';
  }

  /** Filtrar tipos de vehículos */
  get tiposVehiculosFiltrados(): TipoVehiculo[] {
    if (!this.filtro.trim()) {
      return this.tiposVehiculos;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.tiposVehiculos.filter(
      (tipo) =>
        tipo.nombre.toLowerCase().includes(filtroLower) ||
        tipo.descripcion.toLowerCase().includes(filtroLower) ||
        (tipo.claseNombre || '').toLowerCase().includes(filtroLower) ||
        this.getEstadoTexto(tipo.estado).toLowerCase().includes(filtroLower)
    );
  }

  /** Tipos paginados */
  get tiposVehiculosPaginados(): TipoVehiculo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.tiposVehiculosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.tiposVehiculosFiltrados.length / this.registrosPorPagina);
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
    this.tipoVehiculoEditando = {
      id: null,
      nombre: '',
      descripcion: '',
      estado: 'A',
      claseId: this.clases.length > 0 ? this.clases[0].id || 0 : 0,
      claseNombre: ''
    };
    this.mostrarModalForm = true;
  }

  /** Abrir modal editar */
  abrirModalEditar(tipoVehiculo: TipoVehiculo): void {
    this.modoEdicion = true;
    this.tipoVehiculoEditando = { ...tipoVehiculo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  /** Guardar tipo de vehículo */
  guardarTipoVehiculo(): void {
    // Validaciones
    if (!this.tipoVehiculoEditando.nombre.trim()) {
      this.notification.error('El nombre del tipo de vehículo es requerido');
      return;
    }
    if (!this.tipoVehiculoEditando.claseId || this.tipoVehiculoEditando.claseId === 0) {
      this.notification.error('Debe seleccionar una clase');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.tipoVehiculoEditando.id) {
      // Editar
      this.tipoVehiculoService.actualizar(
        this.tipoVehiculoEditando.id,
        this.tipoVehiculoEditando
      ).subscribe({
        next: (response) => {
          console.log('Tipo de vehículo actualizado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al actualizar tipo de vehículo:', err);
          this.notification.error('Error al actualizar el tipo de vehículo');
          this.guardando = false;
        }
      });
    } else {
      // Crear (sin enviar ID)
      const nuevoTipoVehiculo = {
        nombre: this.tipoVehiculoEditando.nombre,
        descripcion: this.tipoVehiculoEditando.descripcion,
        estado: this.tipoVehiculoEditando.estado,
        claseId: this.tipoVehiculoEditando.claseId
      };

      this.tipoVehiculoService.crear(nuevoTipoVehiculo as TipoVehiculo).subscribe({
        next: (response) => {
          console.log('Tipo de vehículo creado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al crear tipo de vehículo:', err);
          this.notification.error('Error al crear el tipo de vehículo');
          this.guardando = false;
        }
      });
    }
  }

  /** Ver detalle */
  verDetalle(tipoVehiculo: TipoVehiculo): void {
    this.tipoVehiculoDetalle = tipoVehiculo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.tipoVehiculoDetalle = null;
  }
}
