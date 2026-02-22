import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionUmbralComponent } from './descripcion-umbral';

describe('DescripcionUmbral', () => {
  let component: DescripcionUmbralComponent;
  let fixture: ComponentFixture<DescripcionUmbralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionUmbralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionUmbralComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
