import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupConfigTabComponent } from './backup-config-tab/backup-config-tab';
import { BackupHistoryTabComponent } from './backup-history-tab/backup-history-tab';
import { BackupJobsTabComponent } from './backup-jobs-tab/backup-jobs-tab';
import { BackupRestoreTabComponent } from './backup-restore-tab/backup-restore-tab';
import { BackupService, BackupNotification } from '../../services/backup/backup.service';

@Component({
  selector: 'app-backup-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    BackupConfigTabComponent,
    BackupHistoryTabComponent,
    BackupJobsTabComponent,
    BackupRestoreTabComponent
  ],
  templateUrl: './backup-manager.html',
  styleUrls: ['./backup-manager.css']
})
export class BackupManagerComponent implements OnInit {
  tabActiva: string = 'ejecutar';
  notificacionesNoLeidas: number = 0;
  notificaciones: BackupNotification[] = [];
  mostrarPanelNotificaciones: boolean = false;

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarContadorNotificaciones();
  }

  cargarContadorNotificaciones(): void {
    this.backupService.contarNoLeidas().subscribe({
      next: (count) => {
        this.notificacionesNoLeidas = count;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[BACKUP] Error cargando notificaciones:', err)
    });
  }

  abrirNotificaciones(): void {
    this.mostrarPanelNotificaciones = true;
    this.backupService.obtenerNoLeidas().subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.cdr.detectChanges();
      }
    });
    this.backupService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.notificacionesNoLeidas = 0;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarNotificaciones(): void {
    this.mostrarPanelNotificaciones = false;
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
  }
}
