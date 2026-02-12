import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoDeudaVehicular } from './tipo-deuda-vehicular';

describe('TipoDeudaVehicular', () => {
  let component: TipoDeudaVehicular;
  let fixture: ComponentFixture<TipoDeudaVehicular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoDeudaVehicular]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoDeudaVehicular);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
