import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ejes } from './ejes';

describe('Ejes', () => {
  let component: Ejes;
  let fixture: ComponentFixture<Ejes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ejes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ejes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
