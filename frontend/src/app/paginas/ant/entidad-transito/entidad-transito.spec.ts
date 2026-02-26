import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntidadTransito } from './entidad-transito';

describe('EntidadTransito', () => {
  let component: EntidadTransito;
  let fixture: ComponentFixture<EntidadTransito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntidadTransito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntidadTransito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
