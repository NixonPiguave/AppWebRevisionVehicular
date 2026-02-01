import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaService, Empresa } from '../../../services/empresa.service';

@Component({
  selector: 'app-empresas',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit {
  // Lista de empresas (se carga desde el backend)
  empresas: Empresa[] = [];
  cargando: boolean = false;
  error: string = '';

  // Filtros y paginación
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  // Modal crear/editar
  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  empresaEditando: Empresa = this.getEmpresaVacia();
  guardando: boolean = false;

  // Modal detalle
  mostrarModalDetalle: boolean = false;
  empresaDetalle: Empresa | null = null;

  // Para subida de logo
  logoPreview: string | null = null;
  logoFile: File | null = null;

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  /**
   * Retorna un objeto empresa vacío
   */
  getEmpresaVacia(): Empresa {
    return {
      empresaId: null,
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      logoempresa: '',
      ruc: ''
    };
  }

  /**
   * Cargar empresas desde el backend
   */
  cargarEmpresas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.empresaService.listarEmpresas().subscribe({
      next: (data) => {
        console.log('Empresas cargadas:', data);
        this.empresas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
        this.error = 'Error al cargar las empresas. Verifica que el backend esté corriendo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Getter para empresas filtradas
  get empresasFiltradas(): Empresa[] {
    if (!this.filtro.trim()) {
      return this.empresas;
    }
    const filtroLower = this.filtro.toLowerCase();
    return this.empresas.filter(
      (empresa) =>
        empresa.nombre.toLowerCase().includes(filtroLower) ||
        empresa.ruc.toLowerCase().includes(filtroLower) ||
        empresa.correo.toLowerCase().includes(filtroLower) ||
        empresa.direccion.toLowerCase().includes(filtroLower) ||
        (empresa.empresaId?.toString() || '').includes(filtroLower)
    );
  }

  // Getter para empresas paginadas
  get empresasPaginadas(): Empresa[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.empresasFiltradas.slice(inicio, fin);
  }

  // Getter para total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.empresasFiltradas.length / this.registrosPorPagina);
  }

  // Getter para array de páginas
  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
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
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.mostrarModalForm = true;
  }

  // Abrir modal para editar
  abrirModalEditar(empresa: Empresa): void {
    this.modoEdicion = true;
    this.empresaEditando = { ...empresa };
    // Si logoempresa contiene datos (base64 o URL), usarlo como preview
    this.logoPreview = empresa.logoempresa && empresa.logoempresa.length > 0 ? empresa.logoempresa : null;
    this.logoFile = null;
    this.mostrarModalForm = true;
  }

  // Cerrar modal form
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
  }

  // Manejar selección de archivo de logo
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.logoFile = file;

      // Crear preview de la imagen y guardar el base64 en logoempresa
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        this.logoPreview = base64Image;
        // Guardar el base64 completo para que se persista en la BD
        this.empresaEditando.logoempresa = base64Image;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // Remover logo seleccionado
  removerLogo(): void {
    this.logoPreview = null;
    this.logoFile = null;
    this.empresaEditando.logoempresa = '';
  }

  // Validar formulario
  validarFormulario(): boolean {
    if (!this.empresaEditando.nombre.trim()) {
      alert('El nombre de la empresa es requerido');
      return false;
    }
    if (!this.empresaEditando.ruc.trim()) {
      alert('El RUC es requerido');
      return false;
    }
    if (!this.empresaEditando.correo.trim()) {
      alert('El correo es requerido');
      return false;
    }
    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.empresaEditando.correo)) {
      alert('El correo no tiene un formato válido');
      return false;
    }
    return true;
  }

  // Guardar empresa (crear o editar)
  guardarEmpresa(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.empresaEditando.empresaId) {
      // Editar existente
      this.empresaService.actualizarEmpresa(this.empresaEditando.empresaId, this.empresaEditando).subscribe({
        next: () => {
          this.cargarEmpresas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al actualizar empresa:', err);
          alert('Error al actualizar la empresa');
          this.guardando = false;
        }
      });
    } else {
      // Crear nueva
      this.empresaService.crearEmpresa(this.empresaEditando).subscribe({
        next: () => {
          this.cargarEmpresas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al crear empresa:', err);
          alert('Error al crear la empresa');
          this.guardando = false;
        }
      });
    }
  }

  // Abrir modal detalle
  verDetalle(empresa: Empresa): void {
    this.empresaDetalle = empresa;
    this.mostrarModalDetalle = true;
  }

  // Cerrar modal detalle
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.empresaDetalle = null;
  }
}
