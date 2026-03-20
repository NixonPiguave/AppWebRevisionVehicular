import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupConfigTabComponent } from '../backup-config-tab/backup-config-tab';
import { BackupService, BackupRecord } from '../../../services/backup/backup.service';

@Component({
  selector: 'app-backup-jobs-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, BackupConfigTabComponent],
  templateUrl: './backup-jobs-tab.html',
  styleUrls: ['./backup-jobs-tab.css']
})
export class BackupJobsTabComponent implements OnInit {
  ejecutando: boolean = false;
  ultimoResultado: BackupRecord | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';
  /** Nombre fijo que anuncia el backend (debe coincidir con el archivo tras un incremental). */
  archivoIncrementalServidor: string | null = null;
  metaIncrementalFallo: boolean = false;
  advertenciaIncrementalAntiguo: boolean = false;

  tipos = [
    {
      id: 'FULL',
      label: 'Respaldo Completo',
      descripcion: 'Copia total de la base de datos. Recomendado semanalmente.',
      icono: 'storage',
      color: 'verde'
    },
    {
      id: 'DIFFERENTIAL',
      label: 'Respaldo Diferencial',
      descripcion: 'Solo los cambios desde el último respaldo completo.',
      icono: 'difference',
      color: 'azul'
    },
    {
      id: 'INCREMENTAL',
      label: 'Respaldo Incremental',
      descripcion:
        'Copia completa de la base en un único archivo que se sobrescribe en cada ejecución (programada o manual).',
      icono: 'add_circle',
      color: 'naranja'
    }
  ];

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.backupService.obtenerArchivoIncrementalConfigurado().subscribe({
      next: (r) => {
        this.archivoIncrementalServidor = r?.nombreArchivo ?? null;
        this.metaIncrementalFallo = false;
      },
      error: () => {
        this.archivoIncrementalServidor = null;
        this.metaIncrementalFallo = true;
      }
    });
  }

  async ejecutarBackup(tipo: string): Promise<void> {
    if (this.ejecutando) return;

    // Usar File System Access API para que el usuario elija carpeta destino
    let dirHandle: FileSystemDirectoryHandle | null = null;
    try {
      dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    } catch (err) {
      // Usuario canceló el selector — no continuar
      return;
    }

    this.ejecutando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.ultimoResultado = null;
    this.cdr.detectChanges();

    this.backupService.ejecutarBackup(tipo).subscribe({
      next: async (record) => {
        this.ultimoResultado = record;

        if (record.estado === 'EXITOSO') {
          const esperado = this.archivoIncrementalServidor;
          this.advertenciaIncrementalAntiguo =
            tipo === 'INCREMENTAL' &&
            !!esperado &&
            !!record.nombreArchivo &&
            record.nombreArchivo !== esperado;
          // Descargar y guardar en la carpeta elegida
          await this.guardarEnCarpeta(record, dirHandle!);
          this.mostrarExito('Respaldo ejecutado y guardado correctamente');
        } else {
          this.mostrarError('El respaldo falló: ' + (record.mensajeError || 'Error desconocido'));
        }

        this.ejecutando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarError(err?.error?.message || 'Error al ejecutar el respaldo');
        this.ejecutando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private async guardarEnCarpeta(
    record: BackupRecord,
    dirHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    this.backupService.descargarBackup(record.recordId).subscribe({
      next: async (blob) => {
        try {
          const fileHandle = await dirHandle.getFileHandle(record.nombreArchivo, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          console.error('[BACKUP] Error al escribir archivo:', err);
        }
      }
    });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
  }

  mostrarError(msg: string): void {
    this.mensajeError = msg;
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 5000);
  }
}
