import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MarcaVehiculoService, MarcaVehiculo } from '../../../services/catalogos_vehiculos/marcas.service';
import { CloudinaryService } from '../../../services/cloudinary.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-marca-vehiculo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './marcas.html',
  styleUrl: './marcas.css',
})
export class MarcaVehiculoComponent implements OnInit {
  marcas: MarcaVehiculo[] = [];
  cargando: boolean = false;
  error: string = '';
  filtro: string = '';
  registrosPorPagina: number = 10;
  paginaActual: number = 1;

  mostrarModalForm: boolean = false;
  modoEdicion: boolean = false;
  marcaEditando: MarcaVehiculo = this.getMarcaVacia();
  guardando: boolean = false;

  mostrarModalDetalle: boolean = false;
  marcaDetalle: MarcaVehiculo | null = null;

  // Variables para Cloudinary
  logoFile: File | null = null;
  logoPreview: string | null = null;
  uploadingLogo: boolean = false;

  // Lista de países
  paises: string[] = [
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda',
    'Arabia Saudita', 'Argelia', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin', 'Bélgica', 'Belice',
    'Benín', 'Bielorrusia', 'Birmania', 'Bolivia', 'Bosnia y Herzegovina', 'Botsuana',
    'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde',
    'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre',
    'Colombia', 'Comoras', 'Corea del Norte', 'Corea del Sur', 'Costa de Marfil',
    'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca', 'Dominica', 'Ecuador', 'Egipto',
    'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea', 'Eslovaquia', 'Eslovenia',
    'España', 'Estados Unidos', 'Estonia', 'Eswatini', 'Etiopía', 'Filipinas',
    'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada',
    'Grecia', 'Guatemala', 'Guinea', 'Guinea-Bisáu', 'Guinea Ecuatorial', 'Guyana',
    'Haití', 'Honduras', 'Hungría', 'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda',
    'Islandia', 'Islas Marshall', 'Islas Salomón', 'Israel', 'Italia', 'Jamaica',
    'Japón', 'Jordania', 'Kazajistán', 'Kenia', 'Kirguistán', 'Kiribati', 'Kuwait',
    'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia', 'Libia', 'Liechtenstein',
    'Lituania', 'Luxemburgo', 'Macedonia del Norte', 'Madagascar', 'Malasia', 'Malaui',
    'Maldivas', 'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México',
    'Micronesia', 'Moldavia', 'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique',
    'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega',
    'Nueva Zelanda', 'Omán', 'Países Bajos', 'Pakistán', 'Palaos', 'Palestina',
    'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia', 'Portugal',
    'Reino Unido', 'República Centroafricana', 'República Checa', 'República del Congo',
    'República Democrática del Congo', 'República Dominicana', 'Ruanda', 'Rumania',
    'Rusia', 'Samoa', 'San Cristóbal y Nieves', 'San Marino', 'San Vicente y las Granadinas',
    'Santa Lucía', 'Santo Tomé y Príncipe', 'Senegal', 'Serbia', 'Seychelles',
    'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Suazilandia',
    'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam', 'Tailandia',
    'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago',
    'Túnez', 'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay',
    'Uzbekistán', 'Vanuatu', 'Vaticano, Ciudad del', 'Venezuela', 'Vietnam', 'Yemen',
    'Yibuti', 'Zambia', 'Zimbabue'
  ];

  // Para el selector de países con filtro
  paisesFiltrados: string[] = [];
  filtroPais: string = '';
  mostrarListaPaises: boolean = false;

  constructor(
    private marcaService: MarcaVehiculoService,
    private cloudinaryService: CloudinaryService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
    this.paisesFiltrados = [...this.paises]; // Inicializar lista filtrada
  }

  getMarcaVacia(): MarcaVehiculo {
    return {
      id: null,
      nombre: '',
      empresa: '',
      paisOrigen: '',
      grupoAutomotriz: '',
      fechaAlta: null,
      fechaBaja: null,
      logoUrl: '',
      estado: 'A'
    };
  }

  cargarMarcas(): void {
    this.cargando = true;
    this.marcaService.listarMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar datos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get marcasFiltradas(): MarcaVehiculo[] {
    const f = this.filtro.toLowerCase();
    return this.marcas.filter(m =>
      m.nombre.toLowerCase().includes(f) ||
      m.empresa.toLowerCase().includes(f) ||
      m.paisOrigen.toLowerCase().includes(f) ||
      m.grupoAutomotriz.toLowerCase().includes(f) ||
      (m.id?.toString() || '').includes(f)
    );
  }

  get marcasPaginadas(): MarcaVehiculo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.marcasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.marcasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  irAPagina(p: number): void {
    this.paginaActual = p;
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }


  //Filtrar países en tiempo real
  filtrarPaises(): void {
    const filtro = this.filtroPais.toLowerCase();
    if (!filtro) {
      this.paisesFiltrados = [...this.paises];
    } else {
      this.paisesFiltrados = this.paises.filter(p =>
        p.toLowerCase().includes(filtro)
      );
    }
  }


  //  Seleccionar país de la lista
  seleccionarPais(pais: string): void {
    this.marcaEditando.paisOrigen = pais;
    this.filtroPais = '';
    this.mostrarListaPaises = false;
  }


  // Mostrar lista de países
  abrirListaPaises(): void {
    this.mostrarListaPaises = true;
    this.filtroPais = '';
    this.paisesFiltrados = [...this.paises];
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.marcaEditando = this.getMarcaVacia();
    this.logoFile = null;
    this.logoPreview = null;
    this.uploadingLogo = false;
    this.mostrarModalForm = true;
  }

  abrirModalEditar(marca: MarcaVehiculo): void {
    this.modoEdicion = true;
    this.marcaEditando = { ...marca };

    // Si tiene logo de Cloudinary, mostrarlo
    this.logoPreview = marca.logoUrl && marca.logoUrl.startsWith('http')
      ? marca.logoUrl
      : null;

    this.logoFile = null;
    this.uploadingLogo = false;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.logoFile = null;
    this.logoPreview = null;
    this.uploadingLogo = false;
  }


  // NUEVO: Manejo de selección de logo
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.notification.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
        input.value = '';
        return;
      }

      // Validar tamaño (máx 2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notification.error(`La imagen no debe superar 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        input.value = '';
        return;
      }

      console.log('[LOGO MARCA] Archivo seleccionado:', file.name);

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


  //  Remover logo
  removerLogo(): void {
    console.log('[LOGO MARCA] Removiendo preview');
    this.logoPreview = null;
    this.logoFile = null;

    if (!this.modoEdicion) {
      this.marcaEditando.logoUrl = '';
    }

    this.cdr.detectChanges();
  }

  guardarMarca(): void {
    if (!this.marcaEditando.nombre.trim()) {
      this.notification.error('El nombre de la marca es obligatorio');
      return;
    }
    if (!this.marcaEditando.paisOrigen || this.marcaEditando.paisOrigen.trim() === '') {
      this.notification.error('Error: Seleccione un país');
      return;
    }
    this.guardando = true;

    // Si hay logo nuevo, subirlo primero
    if (this.logoFile) {
      console.log('[CLOUDINARY] Subiendo logo de marca...');
      this.uploadingLogo = true;

      // Guardar logo antiguo para eliminarlo después
      const logoAntiguo = this.modoEdicion && this.marcaEditando.logoUrl
        ? this.marcaEditando.logoUrl
        : null;

      this.cloudinaryService.uploadImage(this.logoFile, 'marcas').subscribe({
        next: (response) => {
          console.log('[CLOUDINARY] Logo de marca subido:', response.url);
          this.marcaEditando.logoUrl = response.url;

          //  Eliminar logo antiguo de Cloudinary
          if (logoAntiguo && logoAntiguo.startsWith('http')) {
            const publicId = this.cloudinaryService.extractPublicId(logoAntiguo);
            if (publicId) {
              console.log('[CLOUDINARY] Eliminando logo antiguo de marca:', publicId);
              this.cloudinaryService.deleteFile(publicId).subscribe({
                next: () => console.log('[CLOUDINARY] Logo antiguo eliminado'),
                error: (err) => console.warn('[CLOUDINARY] No se pudo eliminar logo antiguo:', err)
              });
            }
          }

          this.guardarMarcaEnBackend();
        },
        error: (err) => {
          console.error('[CLOUDINARY] Error:', err);
          this.notification.error('Error al subir el logo. Intenta de nuevo.');
          this.guardando = false;
          this.uploadingLogo = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Sin logo nuevo, guardar directo
      this.guardarMarcaEnBackend();
    }
  }


  // NUEVO: Guardar marca en backend
  private guardarMarcaEnBackend(): void {
    const idValue = this.marcaEditando.id;

    if (this.modoEdicion && idValue) {
      console.log('[MARCA] Actualizando...', this.marcaEditando);

      this.marcaService.actualizarMarca(idValue, this.marcaEditando).subscribe({
        next: () => {
          console.log('[MARCA] Actualizada OK');
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
          this.uploadingLogo = false;
        },
        error: () => {
          this.guardando = false;
          this.uploadingLogo = false;
          this.notification.error('Error al actualizar');
        }
      });
    } else {
      console.log('[MARCA] Creando...', this.marcaEditando);

      this.marcaService.crearMarca(this.marcaEditando).subscribe({
        next: () => {
          console.log('[MARCA] Creada OK');
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
          this.uploadingLogo = false;
        },
        error: () => {
          this.guardando = false;
          this.uploadingLogo = false;
          this.notification.error('Error al crear');
        }
      });
    }
  }

  verDetalle(marca: MarcaVehiculo): void {
    this.marcaDetalle = marca;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
