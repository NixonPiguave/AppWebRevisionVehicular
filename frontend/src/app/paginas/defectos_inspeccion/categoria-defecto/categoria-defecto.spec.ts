import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaDefecto } from './categoria-defecto';

describe('CategoriaDefecto', () => {
  let component: CategoriaDefecto;
  let fixture: ComponentFixture<CategoriaDefecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaDefecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriaDefecto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
