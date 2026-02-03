import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposDefectos } from './tipos-defectos';

describe('TiposDefectos', () => {
  let component: TiposDefectos;
  let fixture: ComponentFixture<TiposDefectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposDefectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposDefectos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
