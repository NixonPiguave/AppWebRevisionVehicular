import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import {
  VehiculoService,
  Vehiculo,
  AmbitoOperacional,
  CapacidadCarga,
  Categoria,
  Clase,
  Eje,
  MarcaVehiculo,
  Modelo,
  Subcategoria,
  TipoCombustible,
  TipoMatricula,
  TipoVehiculo,
  Traccion
} from '../../../services/gestion_vehicular/vehiculo.service';
import {
  Propietario,
  PropietarioService
} from '../../../services/gestion_vehicular/propietario.service';
import { NotificationService } from '../../../services/notification.service';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import {
  RegistroVehicularBaseUnicaService,
  TurnoRegistroBaseUnica,
  PlacaDisponible
} from '../../../services/rtv/registro-vehicular-base-unica.service';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css'
})
export class VehiculoComponent implements OnInit {

  vehiculos: Vehiculo[] = [];
  vista: 'REGISTRO_BASE_UNICA' | 'VEHICULOS' = 'REGISTRO_BASE_UNICA';
  servicioRegistroBaseUnicaId: number | null = null;
  turnosRegistro: TurnoRegistroBaseUnica[] = [];
  cargandoTurnosRegistro = false;
  placasDisponibles: PlacaDisponible[] = [];
  placaDisponibleIdSeleccionada: number | null = null;
  turnoRegistroSeleccionado: TurnoRegistroBaseUnica | null = null;
  improntaChasisTipo: 'FISICA' | 'OCULAR' | 'INACCESIBLE' = 'FISICA';
  improntaMotorTipo: 'FISICA' | 'OCULAR' | 'INACCESIBLE' = 'FISICA';
  ambito: AmbitoOperacional[] = [];
  capacidadCarga: CapacidadCarga[] = [];
  categoria: Categoria[] = [];
  clase: Clase[] = [];
  eje: Eje[] = [];
  marca: MarcaVehiculo[] = [];
  modelo: Modelo[] = [];
  subcategoria: Subcategoria[] = [];
  tipoCombustible: TipoCombustible[] = [];
  tipoMatricula: TipoMatricula[] = [];
  tipoVehiculo: TipoVehiculo[] = [];
  traccion: Traccion[] = [];

  propietarios: Propietario[] = [];
  filtroPropietario = '';

  coloresVehiculo: string[] = [
    'Blanco',
    'Negro',
    'Gris',
    'Rojo',
    'Azul',
    'Verde',
    'Amarillo',
    'Naranja',
    'Marrón',
    'Plateado'
  ];


  cargando = false;
  error = '';
  filtro = '';

  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  vehiculoEditando: Vehiculo = this.vehiculoVacio();

  mostrarModalDetalle = false;
  vehiculoDetalle: Vehiculo | null = null;

  constructor(
    private vehiculoService: VehiculoService,
    private propietarioService: PropietarioService,
    private servicioService: ServicioService,
    private registroBaseUnicaService: RegistroVehicularBaseUnicaService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.resolverServicioRegistroBaseUnicaYTurnos();
    this.cargarDatosCatalogo();
    this.cargarPropietarios();
    this.route.queryParams.subscribe(params => {
      const turnoId = params['turnoId'] ? Number(params['turnoId']) : null;
      if (turnoId && this.vista === 'REGISTRO_BASE_UNICA') {
        // cuando carguen turnos, intentamos abrir el modal
        const intentar = () => {
          const t = this.turnosRegistro.find(x => x.turnoId === turnoId);
          if (t) this.abrirRegistroImpronta(t);
        };
        setTimeout(intentar, 500);
      }
    });
  }

  private resolverServicioRegistroBaseUnicaYTurnos(): void {
    this.cargando = true;
    this.servicioService.listar().subscribe({
      next: (servicios: Servicio[]) => {
        const s = (servicios ?? []).find(x => {
          const n = (x.nombre ?? '').toUpperCase();
          return n.includes('BASE') && (n.includes('ÚNICA') || n.includes('UNICA')) && n.includes('REGIST');
        });
        this.servicioRegistroBaseUnicaId = s?.idTipoTramite ?? null;
        this.cargando = false;
        this.cdr.detectChanges();
        if (this.servicioRegistroBaseUnicaId != null) {
          this.cargarTurnosRegistro();
        } else {
          this.vista = 'VEHICULOS';
          this.cargarDatos();
        }
      },
      error: () => {
        this.cargando = false;
        this.vista = 'VEHICULOS';
        this.cargarDatos();
      }
    });
  }

  cambiarVista(v: 'REGISTRO_BASE_UNICA' | 'VEHICULOS'): void {
    this.vista = v;
    if (v === 'VEHICULOS') {
      this.cargarDatos();
    } else if (this.servicioRegistroBaseUnicaId != null) {
      this.cargarTurnosRegistro();
    }
  }

  cargarTurnosRegistro(): void {
    if (this.servicioRegistroBaseUnicaId == null) return;
    this.cargandoTurnosRegistro = true;
    this.turnosRegistro = [];
    this.registroBaseUnicaService.listarTurnosEnProceso(this.servicioRegistroBaseUnicaId).subscribe({
      next: (data) => {
        this.turnosRegistro = data ?? [];
        this.cargandoTurnosRegistro = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.turnosRegistro = [];
        this.cargandoTurnosRegistro = false;
        this.notification.error('No se pudieron cargar los turnos EN_PROCESO para registro base única.');
        this.cdr.detectChanges();
      }
    });
  }

  abrirRegistroImpronta(turno: TurnoRegistroBaseUnica): void {
    this.turnoRegistroSeleccionado = turno;
    this.placaDisponibleIdSeleccionada = null;
    this.improntaChasisTipo = 'FISICA';
    this.improntaMotorTipo = 'FISICA';

    this.modoEdicion = false;
    this.vehiculoEditando = this.vehiculoVacio();
    this.vehiculoEditando.propietarioId = turno.propietarioId ?? 0;
    this.filtroPropietario = turno.propietarioNombre ?? '';
    this.mostrarModalForm = true;

    this.registroBaseUnicaService.listarPlacasDisponibles().subscribe({
      next: (placas) => {
        this.placasDisponibles = placas ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.placasDisponibles = [];
        this.notification.error('No se pudieron cargar placas disponibles.');
        this.cdr.detectChanges();
      }
    });
  }

  private registrarBaseUnica(): void {
    if (!this.turnoRegistroSeleccionado) {
      this.notification.error('Debe seleccionar un turno.');
      return;
    }
    if (!this.placaDisponibleIdSeleccionada) {
      this.notification.error('Debe seleccionar una placa disponible.');
      return;
    }
    if (!this.vehiculoEditando.codigoMotor || !this.vehiculoEditando.codigoMotor.trim()) {
      this.notification.error('El código de motor es obligatorio.');
      return;
    }
    if (!this.vehiculoEditando.chasis.trim()) {
      this.notification.error('El chasis es obligatorio');
      return;
    }
    if (!this.vehiculoEditando.vin.trim()) {
      this.notification.error('El VIN es obligatorio');
      return;
    }
    if (this.vehiculoEditando.capacidadPasajeros <= 0) {
      this.notification.error('La capacidad de pasajeros debe ser mayor a 0');
      return;
    }
    if (!this.vehiculoEditando.tipoVehiculoId) {
      this.notification.error('Debe seleccionar un tipo de vehículo');
      return;
    }

    this.guardando = true;
    this.registroBaseUnicaService.registrar({
      turnoId: this.turnoRegistroSeleccionado.turnoId,
      placaDisponibleId: this.placaDisponibleIdSeleccionada,
      vehiculo: { ...this.vehiculoEditando, id: null, matricula: '' },
      improntaChasisTipo: this.improntaChasisTipo,
      improntaMotorTipo: this.improntaMotorTipo,
    }).subscribe({
      next: () => {
        this.notification.success('Vehículo registrado e impronta generada.');
        this.guardando = false;
        this.cerrarModalForm();
        this.cargarTurnosRegistro();
      },
      error: () => {
        this.notification.error('Error al registrar el vehículo para base única.');
        this.guardando = false;
      }
    });
  }

  private vehiculoVacio(): Vehiculo {
    return {
      id: null,
      propietarioId: 0,
      matricula: '',
      chasis: '',
      vin: '',
      modeloVehiculoId: 0,
      anioFabricacion: new Date().getFullYear(),
      color: '',
      estado: 'A',
      capacidadPasajeros: 0,
      tipoVehiculoId: 0,
      capCargaId: 0,
      ambitoOperacionalId: 0,
      ejesId: 0,
      traccionId: 0,
      tipoCombustibleId: 0,
      tipoMatriculaId: 0,
      subcategoriaId: 0
    };
  }


  cargarDatosCatalogo(): void {
    forkJoin({
      ambito: this.vehiculoService.listarAmbitosOperacionales(),
      capacidadCarga: this.vehiculoService.listarCapacidadesCarga(),
      categoria: this.vehiculoService.listarCategorias(),
      clase: this.vehiculoService.listarClases(),
      eje: this.vehiculoService.listarEjes(),
      marca: this.vehiculoService.listarMarcas(),
      modelo: this.vehiculoService.listarModelo(),
      subcategoria: this.vehiculoService.listarSubcategoria(),
      tipoCombustible: this.vehiculoService.listarTiposCombustible(),
      tipoMatricula: this.vehiculoService.listarTiposMatricula(),
      tipoVehiculo: this.vehiculoService.listarTipoVehiculo(),
      traccion: this.vehiculoService.listarTracciones()
    }).subscribe({
      next: (data) => {
        this.ambito = data.ambito;
        this.capacidadCarga = data.capacidadCarga;
        this.categoria = data.categoria;
        this.clase = data.clase;
        this.eje = data.eje;
        this.marca = data.marca;
        this.modelo = data.modelo;
        this.subcategoria = data.subcategoria;
        this.tipoCombustible = data.tipoCombustible;
        this.tipoMatricula = data.tipoMatricula;
        this.tipoVehiculo = data.tipoVehiculo;
        this.traccion = data.traccion;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar catálogos:', err);
      }
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.vehiculoService.listar().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los vehículos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarPropietarios(): void {
    this.propietarioService.listar().subscribe({
      next: (data) => {
        this.propietarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar propietarios:', err);
      }
    });
  }

  get vehiculosFiltrados(): Vehiculo[] {
    if (!this.filtro.trim()) return this.vehiculos;

    const f = this.filtro.toLowerCase();
    return this.vehiculos.filter(v =>
      v.matricula.toLowerCase().includes(f) ||
      v.chasis.toLowerCase().includes(f) ||
      v.vin.toLowerCase().includes(f) ||
      v.color.toLowerCase().includes(f) ||
      v.anioFabricacion.toString().includes(f) ||
      this.getEstadoTexto(v.estado).toLowerCase().includes(f)
    );
  }

  get vehiculosPaginados(): Vehiculo[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.vehiculosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.vehiculosFiltrados.length / this.registrosPorPagina);
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
  }

  get propietariosFiltrados(): Propietario[] {
    const f = this.filtroPropietario.trim().toLowerCase();
    if (!f) return this.propietarios;

    return this.propietarios.filter(p =>
      (p.nombre || '').toLowerCase().includes(f) ||
      (p.documentoIdentidad || '').toLowerCase().includes(f)
    );
  }

  onFiltroPropietarioChange(): void {
    const lista = this.propietariosFiltrados;

    if (!this.filtroPropietario.trim()) {
      this.vehiculoEditando.propietarioId = 0;
      return;
    }

    if (lista.length === 1) {
      this.vehiculoEditando.propietarioId = lista[0].idPropietario ?? 0;
    } else if (lista.length === 0) {
      this.vehiculoEditando.propietarioId = 0;
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.vehiculoEditando = this.vehiculoVacio();
    this.mostrarModalForm = true;
  }

  abrirModalEditar(vehiculo: Vehiculo): void {
    this.modoEdicion = true;
    this.vehiculoEditando = { ...vehiculo };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.turnoRegistroSeleccionado = null;
    this.placasDisponibles = [];
    this.placaDisponibleIdSeleccionada = null;
  }

  guardar(): void {
    if (this.vista === 'REGISTRO_BASE_UNICA' && this.turnoRegistroSeleccionado) {
      this.registrarBaseUnica();
      return;
    }
    if (!this.vehiculoEditando.propietarioId || this.vehiculoEditando.propietarioId <= 0) {
      this.notification.error('Debe seleccionar un propietario');
      return;
    }

    if (!this.vehiculoEditando.chasis.trim()) {
      this.notification.error('El chasis es obligatorio');
      return;
    }

    if (!this.vehiculoEditando.vin.trim()) {
      this.notification.error('El VIN es obligatorio');
      return;
    }

    if (!this.vehiculoEditando.matricula.trim()) {
      this.notification.error('La matrícula es obligatoria');
      return;
    }

    if (this.vehiculoEditando.capacidadPasajeros <= 0) {
      this.notification.error('La capacidad de pasajeros debe ser mayor a 0');
      return;
    }

    if (!this.vehiculoEditando.tipoVehiculoId) {
      this.notification.error('Debe seleccionar un tipo de vehículo');
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.vehiculoEditando.id) {
      this.vehiculoService.actualizar(
        this.vehiculoEditando.id,
        this.vehiculoEditando
      ).subscribe({
        next: () => {
          this.notification.success('Vehículo actualizado correctamente.');
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          this.notification.error('Error al actualizar el vehículo');
          this.guardando = false;
        }
      });
    } else {
      const nuevo: Vehiculo = { ...this.vehiculoEditando, id: null };

      this.vehiculoService.crear(nuevo).subscribe({
        next: () => {
          this.notification.success('Vehículo creado correctamente.');
          this.cerrarModalForm();
          this.guardando = false;
          this.cargarDatos();
        },
        error: () => {
          this.notification.error('Error al crear el vehículo');
          this.guardando = false;
        }
      });
    }
  }

  verDetalle(vehiculo: Vehiculo): void {
    this.vehiculoDetalle = vehiculo;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.vehiculoDetalle = null;
  }

  obtenerNombreAmbito(id: number): string {
    const ambi = this.ambito.find(a => a.id === id);
    return ambi ? ambi.ambito : 'N/A';
  }

  obtenerNombreCapcarga(id: number): string {
    const capcarga = this.capacidadCarga.find(c => c.id === id);
    return capcarga ? capcarga.capacidad + ' ' + capcarga.unidad : 'N/A';
  }

  obtenerNombreCategorias(id: number): string {
    const cate = this.categoria.find(c => c.categoriaid === id);
    return cate ? cate.nombre : 'N/A';
  }

  obtenerNombreClases(id: number): string {
    const clases = this.clase.find(c => c.id === id);
    return clases ? clases.clase : 'N/A';
  }

  obtenerNombreEjes(id: number): string {
    const eje = this.eje.find(e => e.id === id);
    return eje ? 'Ejes: ' + eje.cantidad : 'N/A';
  }

  obtenerNombreMarcas(id: number): string {
    const marca = this.marca.find(m => m.id === id);
    return marca ? marca.nombre : 'N/A';
  }

  obtenerNombreMarcaPorModelo(modeloVehiculoId: number): string {
    const model = this.modelo.find(m => m.id === modeloVehiculoId);
    if (!model) return 'N/A';

    const marca = this.marca.find(ma => ma.id === model.marcaId);
    return marca ? marca.nombre : 'N/A';
  }

  obtenerNombreModelos(id: number): string {
    const model = this.modelo.find(m => m.id === id);
    return model ? model.nombre : 'N/A';
  }

  obtenerNombresubcate(id: number): string {
    const sub = this.subcategoria.find(s => s.id === id);
    return sub ? sub.nombre : 'N/A';
  }

  obtenerNombreCategoriaPorSubcategoria(id: number): string {
    const sub = this.subcategoria.find(s => s.id === id);
    if (!sub) return 'N/A';

    const cate = this.categoria.find(c => c.categoriaid === sub.categoriaId);
    return cate ? cate.nombre : 'N/A';
  }

  obtenerNombreTipoCombus(id: number): string {
    const tipoComb = this.tipoCombustible.find(tc => tc.Id === id);
    return tipoComb ? tipoComb.nombre : 'N/A';
  }

  obtenerNombreTipoMatricula(id: number): string {
    const matri = this.tipoMatricula.find(tm => tm.id === id);
    return matri ? matri.nombre : 'N/A';
  }

  obtenerNombreTipoVehi(id: number): string {
    const tipovehi = this.tipoVehiculo.find(tv => tv.id === id);
    return tipovehi ? tipovehi.nombre : 'N/A';
  }

  obtenerNombreTraccion(id: number): string {
    const traccion = this.traccion.find(tr => tr.id === id);
    return traccion ? traccion.tipo : 'N/A';
  }

  obtenerNombrePropietario(id: number): string {
    const p = this.propietarios.find(pr => pr.idPropietario === id);
    return p ? p.nombre : 'N/A';
  }
}
