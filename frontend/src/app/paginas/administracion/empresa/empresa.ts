import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaService, Empresa } from '../../../services/administracion/empresa.service';

@Component({
  selector: 'app-empresas',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit {
  empresas: Empresa[] = [];
  cargando: boolean = false;
  error: string = '';

  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  empresaEditando: Empresa = this.getEmpresaVacia();
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  empresaDetalle: Empresa | null = null;

  logoPreview: string | null = null;
  logoFile: File | null = null;

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

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

  get empresasFiltradas(): Empresa[] {
    if (!this.filtro.trim()) return this.empresas;
    const filtroLower = this.filtro.toLowerCase();
    return this.empresas.filter(e =>
      e.nombre.toLowerCase().includes(filtroLower) ||
      e.ruc.toLowerCase().includes(filtroLower) ||
      e.correo.toLowerCase().includes(filtroLower) ||
      e.direccion.toLowerCase().includes(filtroLower) ||
      (e.empresaId?.toString() || '').includes(filtroLower)
    );
  }

  get empresasPaginadas(): Empresa[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.empresasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.empresasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) paginas.push(i);
    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  abrirModalCrear(): void {
    // ✅ Validar que no exista ya una empresa registrada
    if (this.empresas.length >= 1) {
      console.warn('[VALIDACIÓN] Ya existe una empresa registrada en el sistema. No se puede crear otra.', {
        empresaExistente: this.empresas[0]
      });
      alert('Ya existe una empresa registrada en el sistema. Solo se permite un registro de empresa.\n\nSi necesitas modificarla, usa el botón Editar.');
      return;
    }

    this.modoEdicion = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoEdicion = true;
    this.empresaEditando = { ...empresa };
    this.logoPreview = empresa.logoempresa && empresa.logoempresa.length > 0 ? empresa.logoempresa : null;
    this.logoFile = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        this.logoPreview = base64Image;
        this.empresaEditando.logoempresa = file.name;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removerLogo(): void {
    this.logoPreview = null;
    this.logoFile = null;
    this.empresaEditando.logoempresa = '';
  }

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.empresaEditando.correo)) {
      alert('El correo no tiene un formato válido');
      return false;
    }
    return true;
  }

  guardarEmpresa(): void {
    if (!this.validarFormulario()) return;

    // Doble check: al guardar también validar que no sea creación duplicada
    if (!this.modoEdicion && this.empresas.length >= 1) {
      console.warn('Intento de crear segunda empresa bloqueado al guardar.', {
        empresaExistente: this.empresas[0]
      });
      alert('Ya existe una empresa registrada. No se puede crear otra.');
      this.cerrarModalForm();
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.empresaEditando.empresaId) {
      this.empresaService.actualizarEmpresa(this.empresaEditando.empresaId, this.empresaEditando).subscribe({
        next: () => {
          console.log('Empresa actualizada correctamente.');
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
      this.empresaService.crearEmpresa(this.empresaEditando).subscribe({
        next: () => {
          console.log('Empresa creada correctamente.');
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

  verDetalle(empresa: Empresa): void {
    this.empresaDetalle = empresa;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.empresaDetalle = null;
  }
}
