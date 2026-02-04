import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodoInspeccionComponent } from './metodo-inspeccion';

describe('MetodoInspeccionComponent', () => {
  let component: MetodoInspeccionComponent;
  let fixture: ComponentFixture<MetodoInspeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetodoInspeccionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MetodoInspeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
