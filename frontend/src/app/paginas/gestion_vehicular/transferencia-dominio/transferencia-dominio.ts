import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Servicio, ServicioService } from '../../../services/administracion/servicio.service';
import {
  TransferenciaDominioService,
  TurnoTransferenciaDominio
} from '../../../services/gestion_vehicular/transferencia-dominio.service';
import { Propietario, PropietarioService } from '../../../services/gestion_vehicular/propietario.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-transferencia-dominio',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './transferencia-dominio.html',
  styleUrl: './transferencia-dominio.css'
})
export class TransferenciaDominioComponent implements OnInit {
  servicioTransferenciaId: number | null = null;
  nombreServicioDetectado: string | null = null;
  cargandoServicio = false;
  cargandoTurnos = false;
  turnos: TurnoTransferenciaDominio[] = [];

  turnoConfirmar: TurnoTransferenciaDominio | null = null;
  ejecutando = false;

  propietarios: Propietario[] = [];
  filtroPropietarioSel = '';
  nuevoPropietarioIdSel: number | null = null;
  mostrarFormNuevoProp = false;
  guardandoPropietario = false;
  nuevoProp = {
    documentoIdentidad: '',
    nombre: '',
    correo: '',
    direccion: '',
    telefono: ''
  };

  constructor(
    private servicioService: ServicioService,
    private transferenciaDominioService: TransferenciaDominioService,
    private propietarioService: PropietarioService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resolverServicioYTurnos();
  }

  get propietariosFiltradosModal(): Propietario[] {
    const f = this.filtroPropietarioSel.trim().toLowerCase();
    if (!f) return this.propietarios;
    return this.propietarios.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(f)) ||
        (p.documentoIdentidad && p.documentoIdentidad.toLowerCase().includes(f))
    );
  }

  private resolverServicioYTurnos(): void {
    this.cargandoServicio = true;
    this.cdr.detectChanges();
    this.servicioService.listar().subscribe({
      next: (servicios: Servicio[]) => {
        const s = this.buscarServicioTransferenciaDominio(servicios ?? []);
        this.servicioTransferenciaId = s?.idTipoTramite ?? null;
        this.nombreServicioDetectado = s?.nombre ?? null;
        this.cargandoServicio = false;
        this.cdr.detectChanges();
        if (this.servicioTransferenciaId != null) {
          this.cargarTurnos();
        } else {
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      },
      error: () => {
        this.cargandoServicio = false;
        this.notification.error('No se pudo cargar el catálogo de servicios.');
        this.cdr.detectChanges();
      }
    });
  }

  private buscarServicioTransferenciaDominio(servicios: Servicio[]): Servicio | undefined {
    return servicios.find((x) => {
      const n = (x.nombre ?? '').toUpperCase();
      const dom = n.includes('DOMINIO');
      const traspaso =
        n.includes('TRASPASO') || n.includes('TRANSFERENCIA') || n.includes('TRASPAS');
      return dom && traspaso;
    });
  }

  cargarTurnos(): void {
    if (this.servicioTransferenciaId == null) return;
    this.cargandoTurnos = true;
    this.turnos = [];
    this.cdr.detectChanges();
    this.transferenciaDominioService.listarTurnosEnProceso(this.servicioTransferenciaId).subscribe({
      next: (data) => {
        this.turnos = data ?? [];
        this.cargandoTurnos = false;
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: () => {
        this.turnos = [];
        this.cargandoTurnos = false;
        this.notification.error('No se pudieron cargar los turnos EN_PROCESO para transferencia de dominio.');
        this.cdr.detectChanges();
      }
    });
  }

  private resetNuevoPropForm(): void {
    this.nuevoProp = {
      documentoIdentidad: '',
      nombre: '',
      correo: '',
      direccion: '',
      telefono: ''
    };
  }

  private cargarPropietariosParaModal(): void {
    this.propietarioService.listar().subscribe({
      next: (data) => {
        this.propietarios = data ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.propietarios = [];
        this.notification.error('No se pudieron cargar los propietarios.');
        this.cdr.detectChanges();
      }
    });
  }

  abrirConfirmacion(t: TurnoTransferenciaDominio): void {
    if (!t.vehiculoId) {
      this.notification.error('Este turno no tiene vehículo asociado; no se puede transferir.');
      return;
    }
    this.turnoConfirmar = t;
    this.nuevoPropietarioIdSel = null;
    this.filtroPropietarioSel = '';
    this.mostrarFormNuevoProp = false;
    this.resetNuevoPropForm();
    this.cargarPropietariosParaModal();
    this.cdr.detectChanges();
  }

  cerrarConfirmacion(): void {
    this.turnoConfirmar = null;
    this.nuevoPropietarioIdSel = null;
    this.mostrarFormNuevoProp = false;
    this.cdr.detectChanges();
  }

  toggleFormNuevoPropietario(): void {
    this.mostrarFormNuevoProp = !this.mostrarFormNuevoProp;
    if (this.mostrarFormNuevoProp) {
      this.resetNuevoPropForm();
    }
    this.cdr.detectChanges();
  }

  /**
   * Control directo del input: ngModel a veces deja ver letras hasta el siguiente ciclo.
   * Sanitiza en el mismo evento input y bloquea teclas no numéricas en keydown.
   */
  onDocumentoInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const sanitized = el.value.replace(/\D/g, '').slice(0, 13);
    if (el.value !== sanitized) {
      el.value = sanitized;
    }
    this.nuevoProp.documentoIdentidad = sanitized;
  }

  onDocumentoKeydown(ev: KeyboardEvent): void {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key;
    if (k.length === 1 && !/\d/.test(k)) {
      ev.preventDefault();
    }
  }

  onTelefonoInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const sanitized = el.value.replace(/\D/g, '').slice(0, 10);
    if (el.value !== sanitized) {
      el.value = sanitized;
    }
    this.nuevoProp.telefono = sanitized;
  }

  onTelefonoKeydown(ev: KeyboardEvent): void {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key;
    if (k.length === 1 && !/\d/.test(k)) {
      ev.preventDefault();
    }
  }

  guardarNuevoPropietario(): void {
    const doc = this.nuevoProp.documentoIdentidad.trim();
    const nom = this.nuevoProp.nombre.trim();
    const cor = this.nuevoProp.correo.trim();
    if (!doc || !nom) {
      this.notification.error('Documento y nombre son obligatorios.');
      return;
    }
    if (!/^[0-9]{10,13}$/.test(doc)) {
      this.notification.error('La cédula / documento debe tener entre 10 y 13 dígitos numéricos.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cor || !emailRegex.test(cor)) {
      this.notification.error('Ingrese un correo electrónico válido.');
      return;
    }
    const tel = this.nuevoProp.telefono.trim();
    if (tel && !/^[0-9]{0,10}$/.test(tel)) {
      this.notification.error('El teléfono debe ser numérico (máx. 10 dígitos).');
      return;
    }

    this.guardandoPropietario = true;
    this.cdr.detectChanges();
    // fechaRegistro la asigna el servidor si no se envía (PropietarioServiceImpl).
    this.propietarioService
      .crear({
        documentoIdentidad: doc,
        nombre: nom,
        correo: cor,
        direccion: this.nuevoProp.direccion.trim() || '',
        telefono: tel || ''
      } as any)
      .subscribe({
      next: (p) => {
        const id = p.idPropietario ?? (p as { idPropietario?: number }).idPropietario;
        if (id != null) {
          this.propietarios = [...this.propietarios, p];
          this.nuevoPropietarioIdSel = id;
        }
        this.mostrarFormNuevoProp = false;
        this.guardandoPropietario = false;
        this.notification.success('Propietario registrado. Quedó seleccionado como nuevo dueño.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoPropietario = false;
        this.notification.error('No se pudo registrar el propietario. Verifique los datos.');
        this.cdr.detectChanges();
      }
    });
  }

  nombrePropietarioSeleccionado(): string {
    if (this.nuevoPropietarioIdSel == null) return '';
    const p = this.propietarios.find((x) => x.idPropietario === this.nuevoPropietarioIdSel);
    return p ? `${p.nombre} (${p.documentoIdentidad})` : '';
  }

  confirmarEjecutar(): void {
    if (!this.turnoConfirmar || this.ejecutando) return;
    if (this.nuevoPropietarioIdSel == null) {
      this.notification.error('Seleccione un propietario existente o registre uno nuevo.');
      return;
    }
    const turnoId = this.turnoConfirmar.turnoId;
    const propId = this.nuevoPropietarioIdSel;
    this.ejecutando = true;
    this.cdr.detectChanges();
    this.transferenciaDominioService.ejecutar(turnoId, propId).subscribe({
      next: (res) => {
        this.notification.success(res.mensaje ?? 'Transferencia completada.');
        this.cerrarConfirmacion();
        this.ejecutando = false;
        this.cargarTurnos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.ejecutando = false;
        const st = err?.status;
        if (st === 409) {
          this.notification.error('El turno no está en proceso o no tiene vehículo asociado.');
        } else if (st === 404) {
          this.notification.error('Turno o propietario no encontrado.');
        } else if (st === 400) {
          this.notification.error('Datos inválidos. Verifique el propietario seleccionado.');
        } else {
          this.notification.error('No se pudo completar la transferencia de dominio.');
        }
        this.cdr.detectChanges();
      }
    });
  }
}
