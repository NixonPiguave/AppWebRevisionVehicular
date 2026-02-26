import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoExcepcion } from './estado-excepcion';

describe('EstadoExcepcion', () => {
  let component: EstadoExcepcion;
  let fixture: ComponentFixture<EstadoExcepcion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoExcepcion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoExcepcion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
