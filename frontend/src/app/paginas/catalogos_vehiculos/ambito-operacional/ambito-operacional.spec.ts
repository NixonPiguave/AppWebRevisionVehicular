import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbitoOperacionalComponent } from './ambito-operacional';

describe('AmbitoOperacional', () => {
  let component: AmbitoOperacionalComponent;
  let fixture: ComponentFixture<AmbitoOperacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbitoOperacionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmbitoOperacionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
