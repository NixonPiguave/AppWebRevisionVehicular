import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaVehiculoComponent } from './marcas';

describe('Marcas', () => {
  let component: MarcaVehiculoComponent;
  let fixture: ComponentFixture<MarcaVehiculoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcaVehiculoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcaVehiculoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
