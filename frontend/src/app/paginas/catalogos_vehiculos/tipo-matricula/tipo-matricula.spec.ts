import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoMatricula } from './tipo-matricula';

describe('TipoMatricula', () => {
  let component: TipoMatricula;
  let fixture: ComponentFixture<TipoMatricula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoMatricula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoMatricula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
