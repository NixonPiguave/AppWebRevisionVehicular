import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamiliaDefecto } from './familia-defecto';

describe('FamiliaDefecto', () => {
  let component: FamiliaDefecto;
  let fixture: ComponentFixture<FamiliaDefecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamiliaDefecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamiliaDefecto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
