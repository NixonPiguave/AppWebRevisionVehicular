import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarizacionMatriculacion } from './calendarizacion-matriculacion';

describe('CalendarizacionMatriculacion', () => {
  let component: CalendarizacionMatriculacion;
  let fixture: ComponentFixture<CalendarizacionMatriculacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarizacionMatriculacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarizacionMatriculacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
