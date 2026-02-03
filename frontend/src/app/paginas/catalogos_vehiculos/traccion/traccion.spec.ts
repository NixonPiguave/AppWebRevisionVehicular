import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Traccion } from './traccion';

describe('Traccion', () => {
  let component: Traccion;
  let fixture: ComponentFixture<Traccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Traccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Traccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
