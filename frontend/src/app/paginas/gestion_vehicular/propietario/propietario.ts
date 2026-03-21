import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropietarioService, Propietario } from '../../../services/gestion_vehicular/propietario.service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-propietario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './propietario.html',
  styleUrl: './propietario.css',
})
export class PropietarioComponent implements OnInit {
  propietarios: Propietario[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  propietarioEditando: Propietario = {
    idPropietario: null,
    nombre: '',
    correo: '',
    direccion: '',
    documentoIdentidad: '',
    telefono: 0
    // NO incluir fechaRegistro aquí - lo genera el backend
  } as Propietario;
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  propietarioDetalle: Propietario | null = null;

  /** Campo auxiliar para teléfono (string) para validación solo números */
  telefonoEdit: string = '';

  constructor(
    private propietarioService: PropietarioService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarPropietarios();
  }

  /** Cargar propietarios */
  cargarPropietarios(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.propietarioService.listar().subscribe({
      next: (data) => {
        console.log('Propietarios cargados:', data);
        this.propietarios = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar propietarios:', err);
        this.error = 'Error al cargar los propietarios. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Filtrar propietarios */
  get propietariosFiltrados(): Propietario[] {
    if (!this.filtro.trim()) {
      return this.propietarios;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.propietarios.filter(
      (prop) =>
        prop.nombre.toLowerCase().includes(filtroLower) ||
        prop.documentoIdentidad.toLowerCase().includes(filtroLower) ||
        prop.correo.toLowerCase().includes(filtroLower) ||
        prop.direccion.toLowerCase().includes(filtroLower) ||
        prop.telefono.toString().includes(filtroLower)
    );
  }

  /** Propietarios paginados */
  get propietariosPaginados(): Propietario[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.propietariosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.propietariosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  /** Formatear fecha para mostrar */
  formatearFecha(fecha: Date): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /** Abrir modal crear */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.propietarioEditando = {
      idPropietario: null,
      nombre: '',
      correo: '',
      direccion: '',
      documentoIdentidad: '',
      telefono: 0
      // NO incluir fechaRegistro - lo genera el backend
    } as Propietario;
    this.telefonoEdit = '';
    this.mostrarModalForm = true;
  }

  /** Abrir modal editar */
  abrirModalEditar(propietario: Propietario): void {
    this.modoEdicion = true;
    this.propietarioEditando = { ...propietario };
    this.telefonoEdit = propietario.telefono ? String(propietario.telefono) : '';
    this.mostrarModalForm = true;
  }

  /** Bloquear teclas no numéricas */
  soloNumeros(event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'e' || key === 'E' || key === '+' || key === '-' || key === '.' || key === ',') {
      event.preventDefault();
    }
    if (!/^\d$/.test(key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key)) {
      event.preventDefault();
    }
  }

  /** Filtrar documento: solo dígitos */
  filtrarSoloNumerosDocumento(): void {
    if (this.propietarioEditando.documentoIdentidad) {
      this.propietarioEditando.documentoIdentidad = this.propietarioEditando.documentoIdentidad.replace(/\D/g, '');
    }
  }

  /** Filtrar teléfono: solo dígitos, máx 10 */
  filtrarSoloNumerosTelefono(): void {
    if (this.telefonoEdit) {
      this.telefonoEdit = this.telefonoEdit.replace(/\D/g, '').slice(0, 10);
    }
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  /** Guardar propietario */
  guardarPropietario(): void {
    // Sincronizar teléfono desde campo string
    this.propietarioEditando.telefono = this.telefonoEdit ? parseInt(this.telefonoEdit, 10) || 0 : 0;

    // Validaciones
    if (!this.propietarioEditando.documentoIdentidad.trim()) {
      this.notification.error('El documento de identidad es requerido');
      return;
    }
    if (!this.propietarioEditando.nombre.trim()) {
      this.notification.error('El nombre es requerido');
      return;
    }
    if (!this.propietarioEditando.correo.trim()) {
      this.notification.error('El correo electrónico es requerido');
      return;
    }
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.propietarioEditando.correo)) {
      this.notification.error('Ingrese un correo electrónico válido');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.propietarioEditando.idPropietario) {
      // Editar
      this.propietarioService.actualizar(
        this.propietarioEditando.idPropietario,
        this.propietarioEditando
      ).subscribe({
        next: (response) => {
          console.log('Propietario actualizado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarPropietarios();
        },
        error: (err) => {
          console.error('Error al actualizar propietario:', err);
          this.notification.error('Error al actualizar el propietario');
          this.guardando = false;
        }
      });
    } else {
      // Crear - enviar fecha actual
      const nuevoPropietario = {
        documentoIdentidad: this.propietarioEditando.documentoIdentidad,
        nombre: this.propietarioEditando.nombre,
        correo: this.propietarioEditando.correo,
        direccion: this.propietarioEditando.direccion,
        telefono: this.propietarioEditando.telefono,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };

      this.propietarioService.crear(nuevoPropietario as any).subscribe({
        next: (response) => {
          console.log('Propietario creado:', response);
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarPropietarios();
        },
        error: (err) => {
          console.error('Error al crear propietario:', err);
          this.notification.error('Error al crear el propietario');
          this.guardando = false;
        }
      });
    }
  }

  /** Ver detalle */
  verDetalle(propietario: Propietario): void {
    this.propietarioDetalle = propietario;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.propietarioDetalle = null;
  }
}
