import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupService, BackupConfig } from '../../../services/backup/backup.service';

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

  /** Subida del JSON de credenciales a /drive-credentials */
  subiendoDriveCredentials = false;
  /** Nombre del último archivo elegido (el navegador no entrega la ruta local completa). */
  ultimoJsonCredencialesNombre = '';

  // Modelo de UI para programar sin escribir cron
  fullActivo = true;
  fullFrecuencia: 'NINGUNO' | 'DIARIO' | 'SEMANAL' | 'PERSONALIZADO' | 'MENSUAL' = 'SEMANAL';
  fullHora = '02:00';
  fullDiaSemana = 'SUN';
  fullDiaMes: number = 1;
  fullDiasSemanaList: string[] = ['SUN'];

  diffActivo = true;
  diffFrecuencia: 'NINGUNO' | 'DIARIO' | 'SEMANAL' | 'PERSONALIZADO' | 'MENSUAL' = 'DIARIO';
  diffHora = '03:00';
  diffDiasSemana = 'MON-SAT';
  diffDiaMes: number = 1;
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
    /**
     * La pestaña de jobs incrusta otra instancia de este componente con soloScheduler=true.
     * Si el usuario cambió la ruta en la otra pestaña, esta instancia aún tiene la ruta vieja en memoria
     * y al guardar solo el programador sobrescribiría la BD. Antes de POST, tomamos la config actual del servidor.
     */
    if (this.soloScheduler) {
      this.actualizarCronsDesdeUI();
      const parcialScheduler = {
        schedulerActivo: this.config.schedulerActivo,
        cronFull: this.config.cronFull,
        cronDiferencial: this.config.cronDiferencial,
        cronIncremental: this.config.cronIncremental
      };
      this.guardando = true;
      this.mensajeError = '';
      this.backupService.obtenerConfig().subscribe({
        next: (fresh) => {
          this.config = { ...fresh, ...parcialScheduler };
          this.backupService.guardarConfig(this.config).subscribe({
            next: (data) => {
              this.config = data;
              this.guardando = false;
              this.mostrarExito('Configuración guardada correctamente');
              this.sincronizarUIDesdeCrons();
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.guardando = false;
              this.mostrarError(err?.error?.message || 'Error al guardar la configuración');
              this.cdr.detectChanges();
            }
          });
        },
        error: () => {
          this.guardando = false;
          this.mostrarError('No se pudo cargar la configuración actual. Intente de nuevo.');
          this.cdr.detectChanges();
        }
      });
      return;
    }

    if (!this.config.rutaServidor?.trim()) {
      this.mostrarError('La ruta del servidor es obligatoria');
      return;
    }
    if (!this.esRutaAbsolutaEnBackend(this.config.rutaServidor)) {
      this.mostrarError(
        'Use una ruta absoluta en el PC donde corre el backend (ej. C:\\Respaldos\\RTV). ' +
          'No use solo el nombre de carpeta; cópiela desde el Explorador (Ctrl+L).'
      );
      return;
    }

    this.actualizarCronsDesdeUI();

    this.guardando = true;
    this.backupService.guardarConfig(this.config).subscribe({
      next: (data) => {
        this.config = data;
        this.guardando = false;
        this.mostrarExito('Configuración guardada correctamente');
        this.sincronizarUIDesdeCrons();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'Error al guardar la configuración');
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Ruta que el backend acepta: absoluta, UNC, Unix, o variables que expande el servidor (%USERPROFILE%, etc.).
   */
  private esRutaAbsolutaEnBackend(r: string): boolean {
    const t = r.trim();
    if (!t) return false;
    if (/^[A-Za-z]:[\\/]/.test(t)) return true;
    if (t.startsWith('\\\\')) return true;
    if (t.startsWith('/')) return true;
    if (/^%[A-Za-z_][A-Za-z0-9_]*%/.test(t)) return true;
    if (t.startsWith('${user.home}')) return true;
    if (t.startsWith('~/') || t.startsWith('~\\')) return true;
    return false;
  }

  /** Cuando el navegador solo da el nombre de la carpeta, el backend expande %USERPROFILE%. */
  private rutaDesdeNombreCarpeta(nombreCarpeta: string): string {
    const n = (nombreCarpeta || '').replace(/^[/\\]+|[/\\]+$/g, '').trim();
    return n ? `%USERPROFILE%\\${n}` : '';
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

  abrirSelectorDriveCredentials(): void {
    const el = document.getElementById('driveCredentialsInput') as HTMLInputElement | null;
    el?.click();
  }

  onDriveCredentialsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!file) return;

    this.ultimoJsonCredencialesNombre = file.name;
    this.subiendoDriveCredentials = true;
    this.mensajeError = '';
    this.cdr.detectChanges();

    this.backupService.guardarDriveCredentials(file).subscribe({
      next: (data) => {
        this.subiendoDriveCredentials = false;
        this.aplicarRespuestaConfigDrive(data);
        this.sincronizarUIDesdeCrons();
        this.mostrarExito('Credenciales Drive guardadas en el servidor. Ruta actualizada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.subiendoDriveCredentials = false;
        const msg =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.message || 'Error al cargar credenciales Drive';
        this.mostrarError(msg);
        this.cdr.detectChanges();
      }
    });

    // Permite volver a seleccionar el mismo archivo.
    if (input) input.value = '';
  }

  /**
   * El POST devuelve un DTO que a veces trae solo campos no nulos; no sustituir todo el modelo
   * o se pierden mail/cron/etc. en pantalla. La ruta efectiva la guarda el backend.
   */
  private aplicarRespuestaConfigDrive(data: BackupConfig | null | undefined): void {
    if (!data || typeof data !== 'object') {
      return;
    }
    const raw = data as unknown as Record<string, unknown>;
    const snake = raw['drive_credentials_path'];
    const path =
      (typeof data.driveCredentialsPath === 'string' && data.driveCredentialsPath) ||
      (typeof snake === 'string' && snake) ||
      '';

    this.config = {
      ...this.config,
      ...data,
      driveCredentialsPath: path || data.driveCredentialsPath || this.config.driveCredentialsPath
    };
  }

  autorizarDriveOAuth(): void {
    this.backupService.obtenerDriveOAuthUrl().subscribe({
      next: (r) => {
        const url = r?.url;
        if (!url) {
          this.mostrarError('No se pudo generar la URL de autorización de Google Drive.');
          return;
        }
        window.open(url, '_blank');
      },
      error: (err) => {
        this.mostrarError(err?.error?.message || 'Error al generar la URL de autorización de Drive');
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
    if (cf.startsWith('0 ')) {
      const partes = cf.split(/\s+/).filter(Boolean);
      if (partes.length >= 6) {
        const minutos = parseInt(partes[1] || '0', 10) || 0;
        const hora = parseInt(partes[2] || '2', 10) || 0;
        this.fullHora = this.horaMinutosAHHMM(hora, minutos);

        const diaDelMes = partes[3] || '*';
        const mesCampo = partes[4] || '*';
        const diaSemanaCampo = partes[5] || '?';

        // Mensual: seg/ min / hora / diaDelMes * ?
        if (diaSemanaCampo === '?' && mesCampo === '*' && diaDelMes !== '*' && diaDelMes !== '?') {
          this.fullFrecuencia = 'MENSUAL';
          this.fullDiaMes = parseInt(diaDelMes, 10) || 1;
        } else if (diaDelMes === '*' && diaSemanaCampo === '?') {
          // Diario
          this.fullFrecuencia = 'DIARIO';
        } else {
          // Semanal / personalizado: ? * (MON|TUE|...|MON,TUE,...)
          const diaCampo = diaSemanaCampo || '*';
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
      }
    }

    // DIFERENCIAL
    this.diffActivo = !!cd;
    if (cd.startsWith('0 ')) {
      const partes = cd.split(/\s+/).filter(Boolean);
      if (partes.length >= 6) {
        const minutos = parseInt(partes[1] || '0', 10) || 0;
        const hora = parseInt(partes[2] || '3', 10) || 0;
        this.diffHora = this.horaMinutosAHHMM(hora, minutos);

        const diaDelMes = partes[3] || '*';
        const mesCampo = partes[4] || '*';
        const diaSemanaCampo = partes[5] || '?';

        // Mensual: seg/ min / hora / diaDelMes * ?
        if (diaSemanaCampo === '?' && mesCampo === '*' && diaDelMes !== '*' && diaDelMes !== '?') {
          this.diffFrecuencia = 'MENSUAL';
          this.diffDiaMes = parseInt(diaDelMes, 10) || 1;
        } else if (diaDelMes === '*' && diaSemanaCampo === '?') {
          // Diario
          this.diffFrecuencia = 'DIARIO';
        } else {
          // Semanal / personalizado: ? * (MON|...|MON,TUE,...)
          const diaCampo = diaSemanaCampo || '*';
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
      } else if (this.fullFrecuencia === 'MENSUAL') {
        this.config.cronFull = `0 ${m} ${h} ${this.fullDiaMes || 1} * ?`;
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
      } else if (this.diffFrecuencia === 'MENSUAL') {
        this.config.cronDiferencial = `0 ${m} ${h} ${this.diffDiaMes || 1} * ?`;
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

  /**
   * Diálogo de carpeta del sistema (Windows): primero el selector clásico del navegador; si expone
   * {@code File.path} (p. ej. algunos entornos), se usa la ruta absoluta. Si no, se rellena
   * {@code %USERPROFILE%\\nombreCarpeta} para que el backend la expanda (misma PC que el backend).
   */
  async elegirCarpeta(): Promise<void> {
    const paso1 = await this.elegirCarpetaMedianteInputDirectorio();
    if (paso1 === 'cancelado') {
      return;
    }
    if (paso1 !== null) {
      this.config.rutaServidor = paso1;
      if (paso1.startsWith('%USERPROFILE%')) {
        this.mostrarExito(
          'Ruta con %USERPROFILE% (su usuario de Windows). Guarde; si la carpeta está en otro disco, edite el campo.'
        );
      } else {
        this.mostrarExito('Ruta absoluta detectada. Pulse Guardar configuración.');
      }
      this.cdr.detectChanges();
      return;
    }

    const w = window as any;
    if (typeof w.showDirectoryPicker !== 'function') {
      this.mostrarError('Use Chrome o Edge, o escriba la ruta a mano.');
      return;
    }
    try {
      const handle = await w.showDirectoryPicker({ mode: 'readwrite' });
      const name = (handle?.name || '').trim();
      if (!name) {
        return;
      }
      this.config.rutaServidor = this.rutaDesdeNombreCarpeta(name);
      this.mostrarExito(
        'Se rellenó %USERPROFILE%\\' + name + '. Guarde; si la carpeta no está bajo su perfil, pegue la ruta completa (Ctrl+L en el Explorador).'
      );
      this.cdr.detectChanges();
    } catch {
      /* usuario canceló */
    }
  }

  private elegirCarpetaMedianteInputDirectorio(): Promise<string | null | 'cancelado'> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      (input as any).webkitdirectory = true;
      (input as any).directory = true;
      input.multiple = true;
      input.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;left:-100px';

      let terminado = false;
      const fin = (v: string | null | 'cancelado') => {
        if (terminado) {
          return;
        }
        terminado = true;
        try {
          document.body.removeChild(input);
        } catch {
          /* */
        }
        resolve(v);
      };

      input.addEventListener('change', () => {
        const files = input.files;
        if (!files?.length) {
          fin(null);
          return;
        }
        const f = files[0] as File & { path?: string };
        if (f.path && typeof f.path === 'string') {
          const conBarras = f.path.replace(/\//g, '\\');
          const carpeta = conBarras.replace(/[/\\][^/\\]+$/, '');
          fin(carpeta || null);
          return;
        }
        const wrp = f.webkitRelativePath || '';
        const segmento = wrp.includes('/') ? wrp.substring(0, wrp.indexOf('/')) : wrp;
        if (segmento) {
          fin(this.rutaDesdeNombreCarpeta(segmento));
          return;
        }
        fin(null);
      });

      input.addEventListener('cancel', () => fin('cancelado'));

      document.body.appendChild(input);
      input.click();
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
