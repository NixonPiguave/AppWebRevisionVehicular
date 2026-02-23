import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaService, Empresa } from '../../../services/administracion/empresa.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

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
  uploadingLogo: boolean = false; // ← NUEVO

  constructor(
    private empresaService: EmpresaService,
    private cloudinaryService: CloudinaryService, // ← NUEVO
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
    if (this.empresas.length >= 1) {
      console.warn('[VALIDACIÓN] Ya existe empresa. No se puede crear otra.');
      alert('Ya existe una empresa registrada.\n\nSolo se permite un registro. Usa el botón Editar para modificarla.');
      return;
    }

    this.modoEdicion = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.uploadingLogo = false;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoEdicion = true;
    this.empresaEditando = { ...empresa };

    // Si tiene logo de Cloudinary (URL), mostrarlo
    this.logoPreview = empresa.logoempresa && empresa.logoempresa.startsWith('http')
      ? empresa.logoempresa
      : null;

    this.logoFile = null;
    this.uploadingLogo = false;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.uploadingLogo = false;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
        input.value = '';
        return;
      }

      // Validar tamaño (máx 2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`La imagen no debe superar 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        input.value = '';
        return;
      }

      console.log('[LOGO] Archivo seleccionado:', file.name, `(${(file.size / 1024).toFixed(2)}KB)`);

      this.logoFile = file;

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removerLogo(): void {
    console.log('[LOGO] Removiendo preview');
    this.logoPreview = null;
    this.logoFile = null;

    if (!this.modoEdicion) {
      this.empresaEditando.logoempresa = '';
    }

    this.cdr.detectChanges();
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

    // Validar RUC (13 dígitos para Ecuador)
    if (!/^\d{13}$/.test(this.empresaEditando.ruc)) {
      alert('El RUC debe tener exactamente 13 dígitos numéricos');
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

    // Doble check al guardar
    if (!this.modoEdicion && this.empresas.length >= 1) {
      console.warn('[VALIDACIÓN] Intento crear segunda empresa bloqueado.');
      alert('Ya existe una empresa. No se puede crear otra.');
      this.cerrarModalForm();
      return;
    }

    this.guardando = true;

    // Si hay logo nuevo, subirlo a Cloudinary primero
    if (this.logoFile) {
      console.log('[CLOUDINARY] Subiendo nuevo logo...');
      this.uploadingLogo = true;

      // Si está en modo edición y tenía logo antiguo, eliminarlo
      const logoAntiguo = this.modoEdicion && this.empresaEditando.logoempresa
        ? this.empresaEditando.logoempresa
        : null;

      this.cloudinaryService.uploadImage(this.logoFile, 'empresas').subscribe({
        next: (response) => {
          console.log('[CLOUDINARY] Nuevo logo subido:', response.url);
          this.empresaEditando.logoempresa = response.url;

          //  Eliminar logo antiguo de Cloudinary
          if (logoAntiguo && logoAntiguo.startsWith('http')) {
            const publicId = this.cloudinaryService.extractPublicId(logoAntiguo);
            if (publicId) {
              console.log('[CLOUDINARY] Eliminando logo antiguo:', publicId);
              this.cloudinaryService.deleteFile(publicId).subscribe({
                next: () => console.log('[CLOUDINARY] Logo antiguo eliminado'),
                error: (err) => console.warn('[CLOUDINARY] No se pudo eliminar logo antiguo:', err)
              });
            }
          }

          this.guardarEmpresaEnBackend();
        },
        error: (err) => {
          console.error('[CLOUDINARY] Error:', err);
          alert('Error al subir la imagen. Intenta de nuevo.');
          this.guardando = false;
          this.uploadingLogo = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Sin logo nuevo, guardar directo
      this.guardarEmpresaEnBackend();
    }
  }

  private guardarEmpresaEnBackend(): void {
    if (this.modoEdicion && this.empresaEditando.empresaId) {
      console.log('[EMPRESA] Actualizando...', this.empresaEditando);

      this.empresaService.actualizarEmpresa(
        this.empresaEditando.empresaId,
        this.empresaEditando
      ).subscribe({
        next: () => {
          console.log('[EMPRESA] Actualizada OK');
          this.cargarEmpresas();
          this.cerrarModalForm();
          this.guardando = false;
          this.uploadingLogo = false;
        },
        error: (err) => {
          console.error('[EMPRESA] Error actualizar:', err);
          alert('Error al actualizar la empresa');
          this.guardando = false;
          this.uploadingLogo = false;
        }
      });
    } else {
      console.log('[EMPRESA] Creando...', this.empresaEditando);

      this.empresaService.crearEmpresa(this.empresaEditando).subscribe({
        next: () => {
          console.log('[EMPRESA] Creada OK');
          this.cargarEmpresas();
          this.cerrarModalForm();
          this.guardando = false;
          this.uploadingLogo = false;
        },
        error: (err) => {
          console.error('[EMPRESA] Error crear:', err);
          alert('Error al crear la empresa');
          this.guardando = false;
          this.uploadingLogo = false;
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
