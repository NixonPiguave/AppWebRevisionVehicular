import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification.service';
import { CertificadosRegistroService } from '../../../services/operaciones/certificados-registro.service';

export interface ImprontaRow {
  id: number;
  fechaRegistro: string;
  codigoImpronta?: string;
  descripcion?: string;
  estado?: string;
  vehiculoId?: number;
  placa?: string;
}

@Component({
  selector: 'app-improntas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './improntas.html',
  styleUrl: './improntas.css'
})
export class ImprontasComponent {
  private readonly api = 'http://localhost:8080/api/improntas';

  placa = '';
  cargando = false;
  improntas: ImprontaRow[] = [];

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private certificados: CertificadosRegistroService,
    private cdr: ChangeDetectorRef
  ) {}

  buscar(): void {
    const placa = this.placa.trim();
    if (!placa) {
      this.notification.error('Ingrese una placa para buscar.');
      return;
    }
    this.cargando = true;
    this.improntas = [];
    this.http.get<ImprontaRow[]>(this.api, { params: { placa } }).subscribe({
      next: (data) => {
        this.improntas = data ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('No se pudieron cargar improntas.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  imprimirPorVehiculoId(vehiculoId?: number): void {
    if (!vehiculoId) {
      this.notification.error('Esta impronta no tiene vehículo asociado.');
      return;
    }
    this.certificados.mostrarImprontaPorVehiculoId(vehiculoId);
  }
}

