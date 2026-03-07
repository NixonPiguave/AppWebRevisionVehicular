import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaService, Empresa } from '../../../services/administracion/empresa.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';

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

  // Variables para logo
  logoPreview: string | null = null;
  logoFile: File | null = null;
  uploadingLogo: boolean = false;

  //  Variables para ícono
  iconoPreview: string | null = null;
  iconoFile: File | null = null;
  uploadingIcono: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private cloudinaryService: CloudinaryService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
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
      iconoempresa: '',
      ruc: ''
    };
  }

  cargarEmpresas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.empresaService.listarEmpresas().subscribe({
      next: (data) => {
        console.log('[EMPRESA] Empresas cargadas:', data);
        this.empresas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[EMPRESA] Error al cargar empresas:', err);
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
      this.notification.error('Ya existe una empresa registrada.\n\nSolo se permite un registro. Usa el botón Editar para modificarla.');
      return;
    }

    this.modoEdicion = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.iconoPreview = null;
    this.iconoFile = null;
    this.uploadingLogo = false;
    this.uploadingIcono = false;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoEdicion = true;
    this.empresaEditando = { ...empresa };

    // Logo
    this.logoPreview = empresa.logoempresa && empresa.logoempresa.startsWith('http')
      ? empresa.logoempresa
      : null;

    // Ícono
    this.iconoPreview = empresa.iconoempresa && empresa.iconoempresa.startsWith('http')
      ? empresa.iconoempresa
      : null;

    this.logoFile = null;
    this.iconoFile = null;
    this.uploadingLogo = false;
    this.uploadingIcono = false;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.empresaEditando = this.getEmpresaVacia();
    this.logoPreview = null;
    this.logoFile = null;
    this.iconoPreview = null;
    this.iconoFile = null;
    this.uploadingLogo = false;
    this.uploadingIcono = false;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.notification.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
        input.value = '';
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notification.error(`La imagen no debe superar 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        input.value = '';
        return;
      }

      console.log('[LOGO] Archivo seleccionado:', file.name);

      this.logoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }


   // NUEVO: Seleccionar ícono
  onIconoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.notification.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
        input.value = '';
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notification.error(`La imagen no debe superar 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        input.value = '';
        return;
      }

      console.log('[ICONO] Archivo seleccionado:', file.name);

      this.iconoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.iconoPreview = e.target?.result as string;
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


   // NUEVO: Remover ícono
  removerIcono(): void {
    console.log('[ICONO] Removiendo preview');
    this.iconoPreview = null;
    this.iconoFile = null;

    if (!this.modoEdicion) {
      this.empresaEditando.iconoempresa = '';
    }

    this.cdr.detectChanges();
  }

  validarFormulario(): boolean {
    if (!this.empresaEditando.nombre.trim()) {
      this.notification.error('El nombre de la empresa es requerido');
      return false;
    }

    if (!this.empresaEditando.ruc.trim()) {
      this.notification.error('El RUC es requerido');
      return false;
    }

    if (!/^\d{13}$/.test(this.empresaEditando.ruc)) {
      this.notification.error('El RUC debe tener exactamente 13 dígitos numéricos');
      return false;
    }

    if (!this.empresaEditando.correo.trim()) {
      this.notification.error('El correo es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.empresaEditando.correo)) {
      this.notification.error('El correo no tiene un formato válido');
      return false;
    }

    return true;
  }

  guardarEmpresa(): void {
    if (!this.validarFormulario()) return;

    if (!this.modoEdicion && this.empresas.length >= 1) {
      console.warn('[VALIDACIÓN] Intento crear segunda empresa bloqueado.');
      this.notification.error('Ya existe una empresa. No se puede crear otra.');
      this.cerrarModalForm();
      return;
    }

    this.guardando = true;

    // Subir ícono Y logo si hay archivos
    const uploadPromises: Promise<void>[] = [];

    // Logo
    if (this.logoFile) {
      const logoAntiguo = this.modoEdicion && this.empresaEditando.logoempresa
        ? this.empresaEditando.logoempresa
        : null;

      uploadPromises.push(
        new Promise((resolve, reject) => {
          this.uploadingLogo = true;
          this.cloudinaryService.uploadImage(this.logoFile!, 'empresas').subscribe({
            next: (response) => {
              console.log('[CLOUDINARY] Logo subido:', response.url);
              this.empresaEditando.logoempresa = response.url;

              if (logoAntiguo && logoAntiguo.startsWith('http')) {
                const publicId = this.cloudinaryService.extractPublicId(logoAntiguo);
                if (publicId) {
                  this.cloudinaryService.deleteFile(publicId).subscribe();
                }
              }

              this.uploadingLogo = false;
              resolve();
            },
            error: (err) => {
              console.error('[CLOUDINARY] Error logo:', err);
              this.uploadingLogo = false;
              reject(err);
            }
          });
        })
      );
    }

    // Ícono
    if (this.iconoFile) {
      const iconoAntiguo = this.modoEdicion && this.empresaEditando.iconoempresa
        ? this.empresaEditando.iconoempresa
        : null;

      uploadPromises.push(
        new Promise((resolve, reject) => {
          this.uploadingIcono = true;
          this.cloudinaryService.uploadImage(this.iconoFile!, 'iconoempresa').subscribe({
            next: (response) => {
              console.log('[CLOUDINARY] Ícono subido:', response.url);
              this.empresaEditando.iconoempresa = response.url;

              if (iconoAntiguo && iconoAntiguo.startsWith('http')) {
                const publicId = this.cloudinaryService.extractPublicId(iconoAntiguo);
                if (publicId) {
                  this.cloudinaryService.deleteFile(publicId).subscribe();
                }
              }

              this.uploadingIcono = false;
              resolve();
            },
            error: (err) => {
              console.error('[CLOUDINARY] Error ícono:', err);
              this.uploadingIcono = false;
              reject(err);
            }
          });
        })
      );
    }

    // Esperar a que todas las subidas terminen
    if (uploadPromises.length > 0) {
      Promise.all(uploadPromises)
        .then(() => {
          this.guardarEmpresaEnBackend();
        })
        .catch((err) => {
          this.notification.error('Error al subir imágenes. Intenta de nuevo.');
          this.guardando = false;
          this.cdr.detectChanges();
        });
    } else {
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
        },
        error: (err) => {
          console.error('[EMPRESA] Error actualizar:', err);
          this.notification.error('Error al actualizar la empresa');
          this.guardando = false;
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
        },
        error: (err) => {
          console.error('[EMPRESA] Error crear:', err);
          this.notification.error('Error al crear la empresa');
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
