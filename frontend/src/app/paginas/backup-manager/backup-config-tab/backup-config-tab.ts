import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupService, BackupConfig, FolderItem } from '../../../services/backup/backup.service';

@Component({
  selector: 'app-backup-config-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './backup-config-tab.html',
  styleUrls: ['./backup-config-tab.css']
})
export class BackupConfigTabComponent implements OnInit {
  @Input() soloScheduler: boolean = false;
  config: BackupConfig = {
    rutaServidor: '',
    driveHabilitado: false,
    schedulerActivo: false
  };

  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  // Selección con explorador nativo (no entrega ruta completa por seguridad)
  carpetaNativaNombre = '';

  // Explorador de carpetas
  mostrarExplorador = false;
  carpetasListadas: FolderItem[] = [];
  rutaExploradorActual = '';
  cargandoCarpetas = false;
  errorCarpetas = '';

  // Modelo de UI para programar sin escribir cron
  fullActivo = true;
  fullFrecuencia: 'NINGUNO' | 'DIARIO' | 'SEMANAL' | 'PERSONALIZADO' = 'SEMANAL';
  fullHora = '02:00';
  fullDiaSemana = 'SUN';
  fullDiasSemanaList: string[] = ['SUN'];

  diffActivo = true;
  diffFrecuencia: 'NINGUNO' | 'DIARIO' | 'SEMANAL' | 'PERSONALIZADO' = 'DIARIO';
  diffHora = '03:00';
  diffDiasSemana = 'MON-SAT';
  diffDiasSemanaList: string[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  incrActivo = true;
  incrFrecuencia: 'NINGUNO' | 'CADA_15' | 'CADA_30' | 'CADA_60' | 'DIARIO' = 'CADA_15';
  incrHora = '01:00';

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarConfig();
  }

  cargarConfig(): void {
    this.cargando = true;
    this.backupService.obtenerConfig().subscribe({
      next: (data) => {
        this.config = data;
        this.sincronizarUIDesdeCrons();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(): void {
    if (!this.config.rutaServidor?.trim()) {
      this.mostrarError('La ruta del servidor es obligatoria');
      return;
    }

    // Actualizar expresiones cron a partir de la selección de la UI
    this.actualizarCronsDesdeUI();

    this.guardando = true;
    this.backupService.guardarConfig(this.config).subscribe({
      next: (data) => {
        this.config = data;
        this.guardando = false;
        this.mostrarExito('Configuración guardada correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'Error al guardar la configuración');
        this.cdr.detectChanges();
      }
    });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  mostrarError(msg: string): void {
    this.mensajeError = msg;
    setTimeout(() => {
      this.mensajeError = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  probarCorreo(): void {
    if (!this.config.emailNotificacion?.trim()) {
      this.mostrarError('Ingresa el correo del administrador');
      return;
    }
    if (!this.config.mailUsername?.trim() || !this.config.mailPassword?.trim()) {
      this.mostrarError('Completa usuario Gmail y App Password');
      return;
    }
    this.backupService.probarCorreo(this.config).subscribe({
      next: () => {
        this.mostrarExito('Correo de prueba enviado correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarError(err?.error?.message || 'Error al enviar correo de prueba');
        this.cdr.detectChanges();
      }
    });
  }

  private pad2(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private horaMinutosAHHMM(hora: number, minuto: number): string {
    return `${this.pad2(hora)}:${this.pad2(minuto)}`;
  }

  private sincronizarUIDesdeCrons(): void {
    const cf = this.config.cronFull || '';
    const cd = this.config.cronDiferencial || '';
    const ci = this.config.cronIncremental || '';

    // FULL
    this.fullActivo = !!cf;
    if (cf.startsWith('0 ') && cf.includes('? *')) {
      const partes = cf.split(' ');
      const minutos = partes[1] || '0';
      const horaStr = partes[2] || '2';
      const hora = parseInt(horaStr, 10);
      this.fullHora = this.horaMinutosAHHMM(hora, parseInt(minutos, 10) || 0);

      const diaCampo = partes[5] || '*';
      if (diaCampo === '*') {
        this.fullFrecuencia = 'DIARIO';
      } else if (diaCampo.includes(',')) {
        this.fullFrecuencia = 'PERSONALIZADO';
        this.fullDiasSemanaList = diaCampo.split(',').map(d => d.trim()).filter(Boolean);
      } else {
        this.fullFrecuencia = 'SEMANAL';
        this.fullDiaSemana = diaCampo;
        this.fullDiasSemanaList = [diaCampo];
      }
    }

    // DIFERENCIAL
    this.diffActivo = !!cd;
    if (cd.startsWith('0 ') && cd.includes('? *')) {
      const partes = cd.split(' ');
      const minutos = partes[1] || '0';
      const horaStr = partes[2] || '3';
      const hora = parseInt(horaStr, 10);
      this.diffHora = this.horaMinutosAHHMM(hora, parseInt(minutos, 10) || 0);

      const diaCampo = partes[5] || '*';
      if (diaCampo === '*') {
        this.diffFrecuencia = 'DIARIO';
        this.diffDiasSemana = '*';
        this.diffDiasSemanaList = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      } else if (diaCampo.includes(',')) {
        this.diffFrecuencia = 'PERSONALIZADO';
        this.diffDiasSemanaList = diaCampo.split(',').map(d => d.trim()).filter(Boolean);
        this.diffDiasSemana = diaCampo;
      } else {
        this.diffFrecuencia = 'SEMANAL';
        this.diffDiasSemana = diaCampo;
        this.diffDiasSemanaList = [diaCampo];
      }
    }

    // INCREMENTAL
    this.incrActivo = !!ci;
    if (ci.startsWith('0 0/15 ')) {
      this.incrFrecuencia = 'CADA_15';
    } else if (ci.startsWith('0 0/30 ')) {
      this.incrFrecuencia = 'CADA_30';
    } else if (ci === '0 0 * * * ?') {
      this.incrFrecuencia = 'CADA_60';
    } else if (ci.startsWith('0 0 ')) {
      const partes = ci.split(' ');
      const minutos = partes[1] || '0';
      const horaStr = partes[2] || '1';
      const hora = parseInt(horaStr, 10);
      this.incrHora = this.horaMinutosAHHMM(hora, parseInt(minutos, 10) || 0);
      this.incrFrecuencia = 'DIARIO';
    }
  }

  private actualizarCronsDesdeUI(): void {
    // FULL
    if (!this.fullActivo || this.fullFrecuencia === 'NINGUNO') {
      this.config.cronFull = '';
    } else {
      const [hStr, mStr] = this.fullHora.split(':');
      const h = parseInt(hStr || '2', 10);
      const m = parseInt(mStr || '0', 10);
      if (this.fullFrecuencia === 'DIARIO') {
        this.config.cronFull = `0 ${m} ${h} * * ?`;
      } else if (this.fullFrecuencia === 'SEMANAL') {
        this.config.cronFull = `0 ${m} ${h} ? * ${this.fullDiaSemana}`;
      } else {
        const dias = (this.fullDiasSemanaList && this.fullDiasSemanaList.length > 0)
          ? this.fullDiasSemanaList.join(',')
          : this.fullDiaSemana;
        this.config.cronFull = `0 ${m} ${h} ? * ${dias}`;
      }
    }

    // DIFERENCIAL
    if (!this.diffActivo || this.diffFrecuencia === 'NINGUNO') {
      this.config.cronDiferencial = '';
    } else {
      const [hStr, mStr] = this.diffHora.split(':');
      const h = parseInt(hStr || '3', 10);
      const m = parseInt(mStr || '0', 10);
      if (this.diffFrecuencia === 'DIARIO') {
        this.config.cronDiferencial = `0 ${m} ${h} * * ?`;
      } else if (this.diffFrecuencia === 'SEMANAL') {
        this.config.cronDiferencial = `0 ${m} ${h} ? * ${this.diffDiasSemana}`;
      } else {
        const dias = (this.diffDiasSemanaList && this.diffDiasSemanaList.length > 0)
          ? this.diffDiasSemanaList.join(',')
          : this.diffDiasSemana;
        this.config.cronDiferencial = `0 ${m} ${h} ? * ${dias}`;
      }
    }

    // INCREMENTAL
    if (!this.incrActivo || this.incrFrecuencia === 'NINGUNO') {
      this.config.cronIncremental = '';
      return;
    }

    switch (this.incrFrecuencia) {
      case 'CADA_15':
        this.config.cronIncremental = '0 0/15 * * * ?';
        break;
      case 'CADA_30':
        this.config.cronIncremental = '0 0/30 * * * ?';
        break;
      case 'CADA_60':
        this.config.cronIncremental = '0 0 * * * ?';
        break;
      case 'DIARIO': {
        const [hStr, mStr] = this.incrHora.split(':');
        const h = parseInt(hStr || '1', 10);
        const m = parseInt(mStr || '0', 10);
        this.config.cronIncremental = `0 ${m} ${h} * * ?`;
        break;
      }
      default:
        this.config.cronIncremental = '';
    }
  }

  get nombreCarpetaSeleccionada(): string {
    const r = this.config?.rutaServidor?.trim();
    if (!r) return '';
    const parts = r.replace(/[/\\]+/g, '/').split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
  }

  /** Igual que en Respaldos manuales: abre el explorador de carpetas. Al seleccionar se asigna y muestra la ruta. */
  async elegirCarpeta(): Promise<void> {
    const win = window as any;
    if (typeof win.showDirectoryPicker === 'function') {
      try {
        const dirHandle = await win.showDirectoryPicker({ mode: 'readwrite' });
        this.carpetaNativaNombre = dirHandle?.name || '';
        this.cdr.detectChanges();
      } catch {
        // Usuario canceló: no hacer nada
        return;
      }
      // No abrir el explorador del servidor después del nativo
      return;
    }
    this.abrirExplorador();
  }

  abrirExplorador(): void {
    this.mostrarExplorador = true;
    // Selector simple: siempre listamos desde la raíz; el usuario elige una carpeta y listo.
    this.rutaExploradorActual = '';
    this.cargarCarpetas();
  }

  cerrarExplorador(): void {
    this.mostrarExplorador = false;
    this.errorCarpetas = '';
  }

  seleccionarCarpeta(item: FolderItem): void {
    this.config.rutaServidor = item.path;
    this.cerrarExplorador();
    this.cdr.detectChanges();
  }

  private cargarCarpetas(): void {
    this.cargandoCarpetas = true;
    this.errorCarpetas = '';
    const path = this.rutaExploradorActual || undefined;
    this.backupService.listarCarpetas(path).subscribe({
      next: (items) => {
        this.carpetasListadas = items;
        this.cargandoCarpetas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoCarpetas = false;
        this.errorCarpetas = err?.error?.message || 'No se pudo listar las carpetas';
        this.carpetasListadas = [];
        this.cdr.detectChanges();
      }
    });
  }

  onToggleDia(tipo: 'FULL' | 'DIFF', dia: string, checked: boolean): void {
    const lista = tipo === 'FULL' ? this.fullDiasSemanaList : this.diffDiasSemanaList;
    if (checked) {
      if (!lista.includes(dia)) {
        lista.push(dia);
      }
    } else {
      const idx = lista.indexOf(dia);
      if (idx >= 0) {
        lista.splice(idx, 1);
      }
    }
    if (tipo === 'FULL') {
      this.fullDiasSemanaList = [...lista];
    } else {
      this.diffDiasSemanaList = [...lista];
    }
  }
}
