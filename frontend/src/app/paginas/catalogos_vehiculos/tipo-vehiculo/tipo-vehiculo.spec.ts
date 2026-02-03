import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoVehiculo } from './tipo-vehiculo';

describe('TipoVehiculo', () => {
  let component: TipoVehiculo;
  let fixture: ComponentFixture<TipoVehiculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoVehiculo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoVehiculo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
