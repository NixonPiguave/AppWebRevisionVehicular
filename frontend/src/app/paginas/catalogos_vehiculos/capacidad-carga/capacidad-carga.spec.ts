import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacidadCarga } from './capacidad-carga';

describe('CapacidadCarga', () => {
  let component: CapacidadCarga;
  let fixture: ComponentFixture<CapacidadCarga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacidadCarga]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacidadCarga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
