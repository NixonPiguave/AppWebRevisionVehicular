import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbitoOperacional } from './ambito-operacional';

describe('AmbitoOperacional', () => {
  let component: AmbitoOperacional;
  let fixture: ComponentFixture<AmbitoOperacional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbitoOperacional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmbitoOperacional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
