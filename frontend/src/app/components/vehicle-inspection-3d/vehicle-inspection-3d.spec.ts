import { ChangeDetectorRef, ElementRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as THREE from 'three';
import { vi } from 'vitest';
import { VehicleInspection3dComponent } from './vehicle-inspection-3d';

describe('VehicleInspection3d interactions without WebGL', () => {
  function setup() {
    const component = new VehicleInspection3dComponent(TestBed.inject(NgZone), {
      markForCheck: vi.fn(),
    } as unknown as ChangeDetectorRef);
    const host = document.createElement('div');
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 900, height: 460 }) as DOMRect;
    component.canvasHost = new ElementRef(host);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ emissive: '#ffffff', emissiveIntensity: 1.5 }),
    );
    mesh.userData = { zone: 'delantera', partLabel: 'Faro delantero' };
    component['zoneMeshes'].set('delantera', [mesh]);
    component['rememberEmission'](mesh);
    vi.spyOn(
      component as unknown as { hitPart: () => THREE.Mesh | undefined },
      'hitPart',
    ).mockReturnValue(mesh);
    return { component, mesh };
  }

  it('identifies a part without selecting it and restores its original LED material on leave', () => {
    const { component, mesh } = setup();
    const selected = vi.spyOn(component.zoneToggled, 'emit');
    component['updateHover']({ clientX: 100, clientY: 100 });
    expect(component.hoveredPart?.label).toBe('Faro delantero');
    expect(selected).not.toHaveBeenCalled();
    expect(mesh.material.emissiveIntensity).toBe(0.28);
    component.clearHover();
    expect(component.hoveredPart).toBeUndefined();
    expect(mesh.material.emissiveIntensity).toBe(1.5);
    component.ngOnDestroy();
  });

  it('keeps selected zones red while hovering', () => {
    const { component, mesh } = setup();
    component.selectedZones = ['delantera'];
    component['updateHover']({ clientX: 100, clientY: 100 });
    expect(component.hoveredPart?.selected).toBe(true);
    expect(mesh.material.emissive.getHexString()).toBe('bd1e31');
    component.clearHover();
    expect(mesh.material.emissive.getHexString()).toBe('bd1e31');
    component.ngOnDestroy();
  });

  it('does not interpret dragging as a click', () => {
    const { component } = setup();
    const selected = vi.spyOn(component.zoneToggled, 'emit');
    component['downPoint'] = { x: 10, y: 10 };
    component['pickZone']({ clientX: 90, clientY: 10, button: 0 } as PointerEvent);
    expect(selected).not.toHaveBeenCalled();
    expect(component['downPoint']).toBeUndefined();
    component.ngOnDestroy();
  });
});
