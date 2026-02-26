import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubfamiliaDefectoService, SubfamiliaDefecto, Familia } from '../../../services/defectos_inspeccion/subfamilia_defecto.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-subfamilia-defecto',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './subfamilia-defecto.html',
  styleUrls: ['./subfamilia-defecto.css'],
})
export class SubfamiliaDefectoComponent implements OnInit {
  subfamilias: SubfamiliaDefecto[] = [];
  familias: Familia[] = []; // ✅ Lista de familias para el selector
  cargando: boolean = false;
  error: string = '';

  // Filtro y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  subfamiliaEditando: SubfamiliaDefecto = this.getSubfamiliaVacia();
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  subfamiliaDetalle: SubfamiliaDefecto | null = null;

  constructor(
    private subfamiliaService: SubfamiliaDefectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  getSubfamiliaVacia(): SubfamiliaDefecto {
    return {
      id: null,
      familiaId: 0,
      nombre: '',
      descripcion: '',
      estado: 'A'
    };
  }


  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.subfamiliaService.listarFamilias().subscribe({
      next: (familias) => {

        //  SOLO FAMILIAS ACTIVAS
        this.familias = familias.filter(f => f.estado === 'A');

        console.log('Familias activas cargadas:', this.familias);

        // luego cargar subfamilias
        this.cargarSubfamilias();
      },
      error: (err) => {
        console.error('Error al cargar familias:', err);
        this.error = 'Error al cargar las familias';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
  cargarSubfamilias(): void {
    this.subfamiliaService.listar().subscribe({
      next: (data) => {
        this.subfamilias = data;
        console.log('Subfamilias cargadas:', data);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar subfamilias:', err);
        this.error = 'Error al cargar las subfamilias';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }


   // Obtener nombre de familia por ID
  getNombreFamilia(familiaId: number): string {
    const familia = this.familias.find(f => f.id === familiaId);
    return familia ? familia.nombre : `ID: ${familiaId}`;
  }

   // Filtrado
  get subfamiliasFiltradas(): SubfamiliaDefecto[] {
    if (!this.filtro.trim()) return this.subfamilias;

    const filtroLower = this.filtro.toLowerCase();
    return this.subfamilias.filter(s => {
      const nombreFamilia = this.getNombreFamilia(s.familiaId).toLowerCase();
      return (
        s.nombre.toLowerCase().includes(filtroLower) ||
        s.descripcion.toLowerCase().includes(filtroLower) ||
        nombreFamilia.includes(filtroLower) ||
        (s.id?.toString() || '').includes(filtroLower)
      );
    });
  }


   // Paginación
  get subfamiliasPaginadas(): SubfamiliaDefecto[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.subfamiliasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.subfamiliasFiltradas.length / this.registrosPorPagina);
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


   // Obtener texto de estado
  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }


   // Abrir modal crear
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.subfamiliaEditando = this.getSubfamiliaVacia();
    this.mostrarModalForm = true;
  }

   //Abrir modal editar
  abrirModalEditar(subfamilia: SubfamiliaDefecto): void {
    this.modoEdicion = true;
    this.subfamiliaEditando = { ...subfamilia };
    this.mostrarModalForm = true;
  }


   // Cerrar modal form

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.subfamiliaEditando = this.getSubfamiliaVacia();
  }


   //Validar formulario
  validarFormulario(): boolean {
    if (!this.subfamiliaEditando.nombre.trim()) {
      alert('El nombre de la subfamilia es obligatorio');
      return false;
    }

    if (!this.subfamiliaEditando.familiaId || this.subfamiliaEditando.familiaId === 0) {
      alert('Debe seleccionar una familia');
      return false;
    }

    return true;
  }


   //Guardar subfamilia
  guardarSubfamilia(): void {
    if (!this.validarFormulario()) return;

    console.log('[SUBFAMILIA] Guardando:', this.subfamiliaEditando);
    this.guardando = true;

    if (this.modoEdicion && this.subfamiliaEditando.id) {
      // Actualizar
      this.subfamiliaService.actualizar(
        this.subfamiliaEditando.id,
        this.subfamiliaEditando
      ).subscribe({
        next: () => {
          console.log('[SUBFAMILIA] Actualizada OK');
          this.cargarSubfamilias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[SUBFAMILIA] Error al actualizar:', err);
          alert('Error al actualizar la subfamilia');
          this.guardando = false;
        }
      });
    } else {
      // Crear
      this.subfamiliaService.crear(this.subfamiliaEditando).subscribe({
        next: () => {
          console.log('[SUBFAMILIA] Creada OK');
          this.cargarSubfamilias();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('[SUBFAMILIA] Error al crear:', err);
          alert('Error al crear la subfamilia');
          this.guardando = false;
        }
      });
    }
  }


   // Ver detalle
  verDetalle(subfamilia: SubfamiliaDefecto): void {
    this.subfamiliaDetalle = subfamilia;
    this.mostrarModalDetalle = true;
  }


   //Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.subfamiliaDetalle = null;
  }
}
