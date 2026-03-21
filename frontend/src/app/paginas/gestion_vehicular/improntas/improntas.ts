import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class ImprontasComponent implements OnInit {
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

  ngOnInit(): void {
    this.cargarImprontas();
  }

  /** Sin placa carga todas; con placa filtra en el backend. */
  private cargarImprontas(placaFiltro?: string): void {
    const placa = placaFiltro?.trim() ?? '';
    this.cargando = true;
    this.improntas = [];
    this.http
      .get<ImprontaRow[]>(this.api, placa ? { params: { placa } } : {})
      .subscribe({
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

  buscar(): void {
    this.cargarImprontas(this.placa);
  }

  imprimirPorVehiculoId(vehiculoId?: number): void {
    if (!vehiculoId) {
      this.notification.error('Esta impronta no tiene vehículo asociado.');
      return;
    }
    this.certificados.mostrarImprontaPorVehiculoId(vehiculoId);
  }
}

