import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Umbral } from './umbral';

describe('Umbral', () => {
  let component: Umbral;
  let fixture: ComponentFixture<Umbral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Umbral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Umbral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
