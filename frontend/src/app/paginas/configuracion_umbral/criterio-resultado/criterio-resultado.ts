import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CriterioResultadoService, CriterioResultado } from '../../../services/configuracion/criterio-resultado.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-criterio-resultado',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './criterio-resultado.html',
  styleUrl: './criterio-resultado.css'
})
export class CriterioResultadoComponent implements OnInit {
  config: CriterioResultado = {
    tipo1Rechaza: false,
    tipo2Rechaza: true,
    tipo3Rechaza: true,
    tipo1Max: null,
    tipo2Max: 0,
    tipo3Max: 0
  };
  cargando = false;
  guardando = false;
  error = '';

  constructor(
    private service: CriterioResultadoService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.obtener().subscribe({
      next: (data) => {
        this.config = {
          criterioId: data.criterioId,
          tipo1Rechaza: data.tipo1Rechaza ?? false,
          tipo2Rechaza: data.tipo2Rechaza ?? true,
          tipo3Rechaza: data.tipo3Rechaza ?? true,
          tipo1Max: data.tipo1Max ?? null,
          tipo2Max: data.tipo2Max ?? 0,
          tipo3Max: data.tipo3Max ?? 0,
          descripcion: data.descripcion
        };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar la configuración.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const key = event.key;
    if (key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight') return true;
    if (key >= '0' && key <= '9') return true;
    event.preventDefault();
    return false;
  }

  guardar(): void {
    const max1 = this.config.tipo1Rechaza ? this.parsearMax(this.config.tipo1Max) : 0;
    const max2 = this.config.tipo2Rechaza ? this.parsearMax(this.config.tipo2Max) : 0;
    const max3 = this.config.tipo3Rechaza ? this.parsearMax(this.config.tipo3Max) : 0;
    if ((this.config.tipo1Rechaza && max1 === null) || (this.config.tipo2Rechaza && max2 === null) || (this.config.tipo3Rechaza && max3 === null)) {
      this.notification.error('Ingrese solo números enteros no negativos en las cantidades máximas.');
      return;
    }
    if ((max1 ?? 0) < 0 || (max2 ?? 0) < 0 || (max3 ?? 0) < 0) {
      this.notification.error('La cantidad máxima permitida no puede ser negativa.');
      return;
    }
    this.config.tipo1Max = max1;
    this.config.tipo2Max = max2;
    this.config.tipo3Max = max3;
    this.guardando = true;
    this.service.guardar(this.config).subscribe({
      next: () => {
        this.guardando = false;
        this.notification.success('Criterios guardados correctamente.');
        this.cargar();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err?.error?.message || 'Error al guardar.');
        this.cdr.detectChanges();
      }
    });
  }

  private parsearMax(val: number | string | null | undefined): number | null {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const n = parseInt(String(val).trim(), 10);
    return isNaN(n) || String(val).trim() !== String(n) ? null : n;
  }
}
