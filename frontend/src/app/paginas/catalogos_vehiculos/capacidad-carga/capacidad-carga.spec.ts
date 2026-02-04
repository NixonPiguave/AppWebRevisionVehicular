import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacidadCargaComponent } from './capacidad-carga';

describe('CapacidadCarga', () => {
  let component: CapacidadCargaComponent;
  let fixture: ComponentFixture<CapacidadCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacidadCargaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacidadCargaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
