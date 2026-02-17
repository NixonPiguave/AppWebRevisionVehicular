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

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.modeloService.listarMarcas().subscribe({
      next: (marcas) => {
        this.marcas = marcas.filter(m => m.estado === 'A');

        this.modeloService.listar().subscribe({
          next: (modelos) => {
            this.modelos = modelos.map(modelo => ({
              ...modelo,
              marcaNombre: this.obtenerNombreMarca(modelo.marcaId)
            }));
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar modelos:', err);
            this.error = 'Error al cargar los modelos.';
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar marcas:', err);
        this.error = 'Error al cargar las marcas.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerNombreMarca(marcaId: number): string {
    const marca = this.marcas.find(m => m.id === marcaId);
    return marca ? marca.nombre : 'Sin marca';
  }

  get modelosFiltrados(): Modelo[] {
    if (!this.filtro.trim()) return this.modelos;
    const filtroLower = this.filtro.toLowerCase();
    return this.modelos.filter(m =>
      m.nombre.toLowerCase().includes(filtroLower) ||
      (m.marcaNombre || '').toLowerCase().includes(filtroLower) ||
      m.anioDesde.toString().includes(filtroLower) ||
      m.anioHasta.toString().includes(filtroLower) ||
      this.getEstadoTexto(m.estado).toLowerCase().includes(filtroLower)
    );
  }

  get modelosPaginados(): Modelo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.modelosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.modelosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) paginas.push(i);
    return paginas;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

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

  abrirModalEditar(modelo: Modelo): void {
    this.modoEdicion = true;
    this.modeloEditando = { ...modelo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  /** Validar que un año sea positivo y exactamente 4 dígitos */
  private validarAnio(anio: number, campo: string): boolean {
    if (anio <= 0) {
      console.warn(`El campo "${campo}" no puede ser negativo ni cero. Valor: ${anio}`);
      alert(`El ${campo} no puede ser negativo ni cero.`);
      return false;
    }
    const anioStr = anio.toString();
    if (anioStr.length !== 4) {
      console.warn(`[VALIDACIÓN] El campo "${campo}" debe tener exactamente 4 dígitos. Valor: ${anio}`);
      alert(`El ${campo} debe tener exactamente 4 dígitos (Ej: 2015). Ingresaste: ${anio}`);
      return false;
    }
    return true;
  }

  guardarModelo(): void {
    // Validar nombre
    if (!this.modeloEditando.nombre.trim()) {
      console.warn('[VALIDACIÓN] El nombre del modelo es requerido.');
      alert('El nombre del modelo es requerido');
      return;
    }

    // Validar marca
    if (!this.modeloEditando.marcaId || this.modeloEditando.marcaId === 0) {
      console.warn('[VALIDACIÓN] Debe seleccionar una marca.');
      alert('Debe seleccionar una marca');
      return;
    }

    //  Validar año desde: no negativo y 4 dígitos
    if (!this.validarAnio(this.modeloEditando.anioDesde, 'Año Desde')) return;

    //  Validar año hasta: no negativo y 4 dígitos
    if (!this.validarAnio(this.modeloEditando.anioHasta, 'Año Hasta')) return;

    // Validar que desde <= hasta
    if (this.modeloEditando.anioDesde > this.modeloEditando.anioHasta) {
      console.warn(`Año Desde (${this.modeloEditando.anioDesde}) no puede ser mayor que Año Hasta (${this.modeloEditando.anioHasta}).`);
      alert('El Año Desde no puede ser mayor que el Año Hasta');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.modeloEditando.id) {
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

  verDetalle(modelo: Modelo): void {
    this.modeloDetalle = modelo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.modeloDetalle = null;
  }
}
