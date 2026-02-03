import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoCombustible } from './tipo-combustible';

describe('TipoCombustible', () => {
  let component: TipoCombustible;
  let fixture: ComponentFixture<TipoCombustible>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoCombustible]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoCombustible);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
