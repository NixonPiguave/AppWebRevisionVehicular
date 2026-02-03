import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subcategorias } from './subcategorias';

describe('Subcategorias', () => {
  let component: Subcategorias;
  let fixture: ComponentFixture<Subcategorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Subcategorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Subcategorias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
