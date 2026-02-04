import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubfamiliaDefectoComponent } from './subfamilia-defecto';

describe('SubfamiliaDefectoComponent', () => {
  let component: SubfamiliaDefectoComponent;
  let fixture: ComponentFixture<SubfamiliaDefectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubfamiliaDefectoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SubfamiliaDefectoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
