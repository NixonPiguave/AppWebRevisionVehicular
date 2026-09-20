import { TestBed } from '@angular/core/testing';
import { VehiclePhotoComponent } from './vehicle-photo';

describe('VehiclePhotoComponent', () => {
  it('shows an honest placeholder when a vehicle has no photograph', () => {
    const fixture = TestBed.createComponent(VehiclePhotoComponent);
    fixture.componentRef.setInput('label', 'GUC-9001');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Sin fotografía');
  });

  it('handles a broken photo and resets the fallback for a replacement', () => {
    const fixture = TestBed.createComponent(VehiclePhotoComponent);
    fixture.componentRef.setInput('url', 'https://example.com/vehicle.jpg');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin fotografía');
    fixture.componentRef.setInput('url', 'https://example.com/replacement.jpg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toContain(
      'replacement.jpg',
    );
  });

  it('does not use arbitrary unsafe URLs as images', () => {
    const component = new VehiclePhotoComponent();
    component.url = 'javascript:alert(1)';
    expect(component.safeUrl).toBeNull();
  });
});
