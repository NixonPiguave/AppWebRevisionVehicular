import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposDefectosComponent } from './tipos-defectos';

describe('TiposDefectosComponent', () => {
  let component: TiposDefectosComponent;
  let fixture: ComponentFixture<TiposDefectosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposDefectosComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TiposDefectosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
