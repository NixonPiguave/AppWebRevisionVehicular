import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CalendarizacionMatriculacionComponent } from './calendarizacion-matriculacion';
import { RecargoCalendarizacionService } from '../../../services/rtv/recargo-calendarizacion.service';
import { CalendarizacionMService } from '../../../services/ant/calendarizacion_matriculacion.service';
import { NotificationService } from '../../../services/notification.service';

describe('CalendarizacionMatriculacionComponent', () => {
  let component: CalendarizacionMatriculacionComponent;
  let fixture: ComponentFixture<CalendarizacionMatriculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarizacionMatriculacionComponent, HttpClientTestingModule],
      providers: [
        {
          provide: RecargoCalendarizacionService,
          useValue: { obtener: () => of({ montoRecargo: 25 }) }
        },
        {
          provide: CalendarizacionMService,
          useValue: { listarRtvDisplay: () => of([{ digito: 1, mesObligatorio: 2, mesNombre: 'Febrero', opcionales: 'Enero' }]) }
        },
        NotificationService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarizacionMatriculacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
