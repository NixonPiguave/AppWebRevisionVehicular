import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Defectos } from './defectos';

describe('Defectos', () => {
  let component: Defectos;
  let fixture: ComponentFixture<Defectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Defectos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Defectos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
