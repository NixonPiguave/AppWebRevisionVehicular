import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionMecatronica } from './revision-mecatronica';

describe('RevisionMecatronica', () => {
  let component: RevisionMecatronica;
  let fixture: ComponentFixture<RevisionMecatronica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionMecatronica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionMecatronica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
