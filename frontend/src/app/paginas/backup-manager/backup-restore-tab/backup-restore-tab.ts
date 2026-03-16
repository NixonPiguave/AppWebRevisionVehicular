import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupService, BackupLocalFile } from '../../../services/backup/backup.service';

@Component({
  selector: 'app-backup-restore-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './backup-restore-tab.html',
  styleUrls: ['./backup-restore-tab.css']
})
export class BackupRestoreTabComponent implements OnInit {
  archivos: BackupLocalFile[] = [];
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  mostrarConfirmacion = false;
  archivoSeleccionado: BackupLocalFile | null = null;
  restaurando = false;

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarArchivos();
  }

  cargarArchivos(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.cargando = true;
    this.backupService.listarArchivosLocales().subscribe({
      next: (data) => {
        this.archivos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err?.error?.message || err?.message || 'Error al listar archivos locales. Verifique la configuración de respaldos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarRestaurar(f: BackupLocalFile): void {
    this.archivoSeleccionado = f;
    this.mostrarConfirmacion = true;
  }

  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.archivoSeleccionado = null;
  }

  ejecutarRestore(): void {
    if (!this.archivoSeleccionado) return;
    this.restaurando = true;
    this.backupService.ejecutarRestore(this.archivoSeleccionado.nombreArchivo).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje || 'Restauración completada. Se recomienda reiniciar la aplicación.';
        this.cerrarConfirmacion();
        this.restaurando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err?.error?.message || err?.message || 'Error al restaurar.';
        this.cerrarConfirmacion();
        this.restaurando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
