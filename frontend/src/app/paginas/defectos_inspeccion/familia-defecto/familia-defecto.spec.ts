import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamiliaDefectoComponent } from './familia-defecto';

describe('FamiliaDefectoComponent', () => {
  let component: FamiliaDefectoComponent;
  let fixture: ComponentFixture<FamiliaDefectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamiliaDefectoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FamiliaDefectoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
