import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { RecargoCalendarizacionService } from '../../../services/rtv/recargo-calendarizacion.service';
import { CalendarizacionMService, CalendarizacionRtvDisplay } from '../../../services/ant/calendarizacion_matriculacion.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-calendarizacion-matriculacion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './calendarizacion-matriculacion.html',
  styleUrl: './calendarizacion-matriculacion.css'
})
export class CalendarizacionMatriculacionComponent implements OnInit {
  tablaCalendarizacion: CalendarizacionRtvDisplay[] = [];

  montoRecargoEdit = '';
  cargando = false;
  guardando = false;
  error = '';

  constructor(
    private recargoService: RecargoCalendarizacionService,
    private calendService: CalendarizacionMService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({
      calend: this.calendService.listarRtvDisplay(),
      recargo: this.recargoService.obtener()
    }).subscribe({
      next: ({ calend, recargo }) => {
        this.tablaCalendarizacion = calend ?? [];
        this.montoRecargoEdit = recargo?.montoRecargo != null ? String(recargo.montoRecargo) : '25';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al cargar los datos.';
        this.montoRecargoEdit = '25';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  soloNumerosDecimal(event: KeyboardEvent): boolean {
    const key = event.key;
    if (key === 'Backspace' || key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight') return true;
    if (key >= '0' && key <= '9') return true;
    if (key === '.' || key === ',') {
      const val = this.montoRecargoEdit || '';
      if (val.includes('.') || val.includes(',')) event.preventDefault();
      return true;
    }
    event.preventDefault();
    return false;
  }

  guardarRecargo(): void {
    const str = (this.montoRecargoEdit || '').trim().replace(',', '.');
    const num = parseFloat(str);
    if (isNaN(num) || num < 0) {
      this.notification.error('Ingrese un monto válido (número mayor o igual a 0).');
      return;
    }
    this.guardando = true;
    this.recargoService.actualizar({ montoRecargo: num }).subscribe({
      next: (data) => {
        this.montoRecargoEdit = String(data.montoRecargo);
        this.guardando = false;
        this.notification.success('Monto de recargo actualizado correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.notification.error(err?.error?.message || 'Error al guardar.');
        this.cdr.detectChanges();
      }
    });
  }
}
