import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquiposService, Equipo } from '../../../services/inspeccion_rtv/equipos.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';
import { LineasService, Linea } from '../../../services/inspeccion_rtv/lineas.service';

@Component({
  selector: 'app-equipos',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css',
})
export class Equipos implements OnInit {
  equipos: Equipo[] = [];
  lineas: Linea[] = [];
  cargando: boolean = false;
  error: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  equipoEditando: Equipo = this.getEquipoVacio();
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  equipoDetalle: Equipo | null = null;

  //  Errores de validación por campo
  erroresValidacion: {
    codigoInterno?: string;
    ultimaCalibracion?: string;
    ultimoMantenimiento?: string;
    lineaId?: string;
  } = {};

  constructor(
    private equiposService: EquiposService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService,
    private lineasService: LineasService
  ) {}

  ngOnInit(): void {
    this.cargarLineas();
    this.cargarEquipos();
  }

  getEquipoVacio(): Equipo {
    return {
      equipoid: null,
      influencia: 0,
      ultimaCalibracion: null,
      ultimoMantenimiento: null,
      estado: 'A',
      codigoInterno: '',
      equipo: '',
      modelo: '',
      serialEquipo: '',
      lineaId: null
    };
  }

  cargarLineas(): void {
    // Siempre reiniciar antes de pedir a BD
    this.lineas = [];
    this.lineasService.listarRoles().subscribe({
      next: (data) => {
        const lista = (data ?? []) as Linea[];
        this.lineas = Array.isArray(lista) ? lista : [];
        console.log('[EQUIPOS] Líneas cargadas:', this.lineas);
        if (this.lineas.length === 0) {
          this.notification.warn('No se encontraron líneas de inspección en la base de datos.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[EQUIPOS] Error al cargar líneas:', err);
        this.lineas = [];
        this.notification.error('No se pudieron cargar las líneas. Verifica el backend.');
        this.cdr.detectChanges();
      }
    });
  }

  cargarEquipos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.equiposService.listarEquipos().subscribe({
      next: (data) => {
        console.log('[EQUIPOS] Cargados:', data);
        this.equipos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[EQUIPOS] Error al cargar:', err);
        this.error = 'Error al cargar los equipos. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get equiposFiltrados(): Equipo[] {
    if (!this.filtro.trim()) {
      return [...this.equipos].sort(
        (a, b) => (a.equipoid ?? 0) - (b.equipoid ?? 0)
      );
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.equipos
      .filter(
      (equipo) =>
        equipo.equipo.toLowerCase().includes(filtroLower) ||
        equipo.modelo.toLowerCase().includes(filtroLower) ||
        equipo.serialEquipo.toLowerCase().includes(filtroLower) ||
        equipo.codigoInterno.toLowerCase().includes(filtroLower) ||
        this.getEstadoTexto(equipo.estado).toLowerCase().includes(filtroLower)
      )
      .sort((a, b) => (a.equipoid ?? 0) - (b.equipoid ?? 0));
  }

  get equiposPaginados(): Equipo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.equiposFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.equiposFiltrados.length / this.registrosPorPagina);
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

  getInfluenciaTexto(influencia: number): string {
    return influencia === 1 ? 'SI' : 'NO';
  }

  getLineaNombre(lineaId?: number | null): string {
    if (lineaId == null) return '-';
    return this.lineas.find(l => l.id === lineaId)?.nombre ?? `Línea #${lineaId}`;
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'No registrada';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES');
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
    if (this.lineas.length === 0) this.cargarLineas();
    this.modoEdicion = false;
    this.equipoEditando = this.getEquipoVacio();
    this.erroresValidacion = {};
    this.mostrarModalForm = true;
  }

  abrirModalEditar(equipo: Equipo): void {
    if (this.lineas.length === 0) this.cargarLineas();
    this.modoEdicion = true;
    this.equipoEditando = { ...equipo };
    this.erroresValidacion = {};
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.equipoEditando = this.getEquipoVacio();
    this.erroresValidacion = {};
  }


  //Validar campos únicos y fechas
  validarFormulario(): boolean {
    this.erroresValidacion = {}; // Limpiar errores previos

    // Validaciones básicas
    if (!this.equipoEditando.equipo.trim()) {
      this.notification.error('El nombre del equipo es requerido');
      return false;
    }

    if (!this.equipoEditando.modelo.trim()) {
      this.notification.error('El modelo es requerido');
      return false;
    }

    if (!this.equipoEditando.serialEquipo.trim()) {
      this.notification.error('El número de serie es requerido');
      return false;
    }

    if (!this.equipoEditando.codigoInterno.trim()) {
      this.notification.error('El código interno es requerido');
      return false;
    }

    if (this.equipoEditando.lineaId == null) {
      this.notification.error('La línea a la que pertenece el equipo es requerida');
      return false;
    }

    // Validar unicidad de código interno (solo si cambió o es nuevo)
    if (!this.modoEdicion || this.codigoCambio()) {
      const codigoDuplicado = this.equipos.find(
        e => e.codigoInterno.toLowerCase() === this.equipoEditando.codigoInterno.toLowerCase() &&
          e.equipoid !== this.equipoEditando.equipoid
      );
      if (codigoDuplicado) {
        this.erroresValidacion.codigoInterno = 'Este código interno ya está registrado';
        this.notification.error('El código interno ya está registrado en otro equipo');
        return false;
      }
    }

    // Validar fechas no futuras
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ignorar hora

    if (this.equipoEditando.ultimaCalibracion) {
      const fechaCalibracion = new Date(this.equipoEditando.ultimaCalibracion);
      fechaCalibracion.setHours(0, 0, 0, 0);

      if (fechaCalibracion > hoy) {
        this.erroresValidacion.ultimaCalibracion = 'La fecha de calibración no puede ser futura';
        this.notification.error('La fecha de última calibración no puede ser mayor a la fecha actual');
        return false;
      }
    }

    if (this.equipoEditando.ultimoMantenimiento) {
      const fechaMantenimiento = new Date(this.equipoEditando.ultimoMantenimiento);
      fechaMantenimiento.setHours(0, 0, 0, 0);

      if (fechaMantenimiento > hoy) {
        this.erroresValidacion.ultimoMantenimiento = 'La fecha de mantenimiento no puede ser futura';
        this.notification.error('La fecha de último mantenimiento no puede ser mayor a la fecha actual');
        return false;
      }
    }

    return true;
  }


  //Detectar si cambió el código interno
  private codigoCambio(): boolean {
    const equipoOriginal = this.equipos.find(e => e.equipoid === this.equipoEditando.equipoid);
    return !equipoOriginal || equipoOriginal.codigoInterno !== this.equipoEditando.codigoInterno;
  }


  getFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //Manejo de errores del backend
  guardarEquipo(): void {
    if (!this.validarFormulario()) return;

    console.log('[EQUIPOS] Guardando:', this.equipoEditando);
    this.guardando = true;

    if (this.modoEdicion && this.equipoEditando.equipoid) {
      // Editar existente
      this.equiposService.actualizarEquipo(this.equipoEditando.equipoid, this.equipoEditando).subscribe({
        next: () => {
          console.log('[EQUIPOS] Actualizado OK');
          this.guardando = false;
          this.notification.success('Equipo modificado correctamente.');
          this.cerrarModalForm();
          this.cdr.detectChanges();
          this.cargarEquipos();
        },
        error: (err) => {
          console.error('[EQUIPOS] Error al actualizar:', err);
          this.manejarErrorBackend(err);
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.equiposService.crearEquipo(this.equipoEditando).subscribe({
        next: () => {
          console.log('[EQUIPOS] Creado OK');
          this.guardando = false;
          this.notification.success('Equipo guardado correctamente.');
          this.cerrarModalForm();
          this.cdr.detectChanges();
          this.cargarEquipos();
        },
        error: (err) => {
          this.guardando = false;
          this.manejarErrorBackend(err);
        }
      });
    }
  }


  // Interpretar errores del backend
  private manejarErrorBackend(err: any): void {
    const mensajeError = err.error?.message || err.error || err.message || 'Error desconocido';
    console.log('[EQUIPOS] Mensaje de error:', mensajeError);

    // Detectar tipo de error por palabras clave
    const mensajeLower = mensajeError.toLowerCase();

    if (mensajeLower.includes('codigo') || mensajeLower.includes('código')) {
      this.erroresValidacion.codigoInterno = 'El código interno ya está registrado';
      this.notification.error('Error: El código interno ya existe en el sistema');
    } else if (mensajeLower.includes('unique') || mensajeLower.includes('duplicate') || mensajeLower.includes('duplicado')) {
      // Error genérico de duplicado
      this.notification.error('Error: Ya existe un registro con estos datos. Verifica el número de serie y código interno.');
    } else {
      // Error genérico
      this.notification.error(`Error al guardar el equipo: ${mensajeError}`);
    }

    this.cdr.detectChanges();
  }

  verDetalle(equipo: Equipo): void {
    this.equipoDetalle = equipo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.equipoDetalle = null;
  }
}
