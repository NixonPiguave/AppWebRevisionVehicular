import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoCombustibleComponent } from './tipo-combustible';

describe('TipoCombustible', () => {
  let component: TipoCombustibleComponent;
  let fixture: ComponentFixture<TipoCombustibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoCombustibleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoCombustibleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
