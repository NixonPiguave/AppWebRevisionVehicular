import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodoInspeccion } from './metodo-inspeccion';

describe('MetodoInspeccion', () => {
  let component: MetodoInspeccion;
  let fixture: ComponentFixture<MetodoInspeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetodoInspeccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetodoInspeccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
