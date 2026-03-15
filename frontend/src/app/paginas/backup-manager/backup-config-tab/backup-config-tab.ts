import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  config: BackupConfig = {
    rutaServidor: '',
    driveHabilitado: false,
    schedulerActivo: false
  };

  cargando: boolean = false;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  ejemplosCron = [
    { label: 'Cada día a las 2:00 AM',     valor: '0 0 2 * * ?' },
    { label: 'Cada domingo a las 2:00 AM', valor: '0 0 2 ? * SUN' },
    { label: 'Cada hora',                  valor: '0 0 * * * ?' },
    { label: 'Lunes a viernes 1:00 AM',    valor: '0 0 1 ? * MON-FRI' }
  ];

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

  aplicarCron(campo: 'cronFull' | 'cronDiferencial' | 'cronIncremental', valor: string): void {
    this.config[campo] = valor;
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 3000);
  }

  mostrarError(msg: string): void {
    this.mensajeError = msg;
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 4000);
  }
}
