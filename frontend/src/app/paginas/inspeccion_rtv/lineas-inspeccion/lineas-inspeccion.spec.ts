import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineasInspeccionComponent } from './lineas-inspeccion';

describe('LineasInspeccion', () => {
  let component: LineasInspeccionComponent;
  let fixture: ComponentFixture<LineasInspeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineasInspeccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineasInspeccionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
