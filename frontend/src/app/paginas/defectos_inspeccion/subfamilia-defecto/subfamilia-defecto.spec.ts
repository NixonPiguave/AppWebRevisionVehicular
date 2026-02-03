import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubfamiliaDefecto } from './subfamilia-defecto';

describe('SubfamiliaDefecto', () => {
  let component: SubfamiliaDefecto;
  let fixture: ComponentFixture<SubfamiliaDefecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubfamiliaDefecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubfamiliaDefecto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
