import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackupService, BackupRecord } from '../../../services/backup/backup.service';

@Component({
  selector: 'app-backup-history-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './backup-history-tab.html',
  styleUrls: ['./backup-history-tab.css']
})
export class BackupHistoryTabComponent implements OnInit {
  registros: BackupRecord[] = [];
  registrosFiltrados: BackupRecord[] = [];
  cargando: boolean = false;
  mensajeError: string = '';

  filtroTipo: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(
    private backupService: BackupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.backupService.obtenerHistorial().subscribe({
      next: (data) => {
        this.registros = data;
        this.filtrar();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'Error al cargar el historial';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    this.registrosFiltrados = this.filtroTipo
      ? this.registros.filter(r => r.tipo === this.filtroTipo)
      : [...this.registros];
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.registrosFiltrados.length / this.elementosPorPagina);
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas || 1;
  }

  get registrosPaginados(): BackupRecord[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.registrosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  get paginasArray(): number[] {
    const paginas: number[] = [];
    const max = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(max / 2));
    let fin = Math.min(this.totalPaginas, inicio + max - 1);
    if (fin - inicio + 1 < max) inicio = Math.max(1, fin - max + 1);
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  async descargar(record: BackupRecord): Promise<void> {
    let dirHandle: FileSystemDirectoryHandle | null = null;
    try {
      dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    } catch { return; }

    this.backupService.descargarBackup(record.recordId).subscribe({
      next: async (blob) => {
        try {
          const fileHandle = await dirHandle!.getFileHandle(record.nombreArchivo, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          console.error('[BACKUP] Error al guardar archivo:', err);
        }
      }
    });
  }

  marcarComoFallido(record: BackupRecord): void {
    this.backupService.marcarComoFallido(record.recordId).subscribe({
      next: () => this.cargarHistorial(),
      error: (err) => {
        this.mensajeError = err?.error?.message || 'Error al marcar como fallido';
        this.cdr.detectChanges();
      }
    });
  }
}
