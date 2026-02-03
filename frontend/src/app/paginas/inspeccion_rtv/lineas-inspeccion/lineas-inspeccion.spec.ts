import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineasInspeccion } from './lineas-inspeccion';

describe('LineasInspeccion', () => {
  let component: LineasInspeccion;
  let fixture: ComponentFixture<LineasInspeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineasInspeccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineasInspeccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
