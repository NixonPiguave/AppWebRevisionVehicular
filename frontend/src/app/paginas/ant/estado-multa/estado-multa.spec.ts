import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoMulta } from './estado-multa';

describe('EstadoMulta', () => {
  let component: EstadoMulta;
  let fixture: ComponentFixture<EstadoMulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoMulta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoMulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
