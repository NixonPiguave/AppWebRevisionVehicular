import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescripcionUmbral } from './descripcion-umbral';

describe('DescripcionUmbral', () => {
  let component: DescripcionUmbral;
  let fixture: ComponentFixture<DescripcionUmbral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescripcionUmbral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescripcionUmbral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
