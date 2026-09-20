import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { partLabel, tooltipPosition, ZONE_LABELS } from './vehicle-part-info';

export type VehicleZone =
  | 'delantera'
  | 'trasera'
  | 'lateralIzquierdo'
  | 'lateralDerecho'
  | 'ruedaDelIzq'
  | 'ruedaDelDer'
  | 'ruedaTraIzq'
  | 'ruedaTraDer'
  | 'habitaculo'
  | 'parteInferior'
  | 'ruedaDelantera'
  | 'ruedaTrasera'
  | 'chasis';

@Component({
  selector: 'app-vehicle-inspection-3d',
  standalone: true,
  templateUrl: './vehicle-inspection-3d.html',
  styleUrl: './vehicle-inspection-3d.css',
})
export class VehicleInspection3dComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() motorcycle = false;
  @Input() selectedZones: VehicleZone[] = [];
  @Output() zoneToggled = new EventEmitter<VehicleZone>();
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private resizeObserver?: ResizeObserver;
  private animationId = 0;
  private downPoint?: { x: number; y: number };
  private zoneMeshes = new Map<VehicleZone, THREE.Mesh[]>();
  private modelVersion = 0;
  private destroyed = false;
  private floor?: THREE.Mesh;
  private environment?: THREE.WebGLRenderTarget;
  private hoveredMesh?: THREE.Mesh;
  private pendingPointer?: { clientX: number; clientY: number };
  private readonly baseEmission = new WeakMap<
    THREE.Material,
    { color: THREE.Color; intensity: number }
  >();
  private fitDistance = 12;
  private modelCenter = new THREE.Vector3(0, 0.25, 0);
  hoveredPart?: { label: string; location: string; selected: boolean; x: number; y: number };
  status = 'Cargando modelo 3D…';

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.createViewer());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedZones'] && this.renderer) this.paintSelection();
    if (changes['motorcycle'] && this.renderer) this.rebuildModel();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.disposeObject(this.scene);
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.environment?.dispose();
  }

  resetView(): void {
    this.clearHover();
    this.camera.position.copy(
      new THREE.Vector3(-1, 0.62, -1.15)
        .normalize()
        .multiplyScalar(this.fitDistance)
        .add(this.modelCenter),
    );
    this.controls?.target.copy(this.modelCenter);
    this.controls?.update();
  }

  showUnderside(): void {
    this.clearHover();
    this.camera.position.set(-5, -5, -6);
    this.controls?.target.set(0, 0, 0);
    this.controls?.update();
  }

  private createViewer(): void {
    this.scene.background = new THREE.Color('#f7faf8');
    this.camera.position.set(7.5, 5.5, 8);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    // Real reflections are essential for metallic paint; lights alone look flat.
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(room, 0.04);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.85;
    room.dispose();
    pmrem.dispose();
    this.canvasHost.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 24;
    this.controls.maxPolarAngle = Math.PI * 0.95;
    this.controls.target.set(0, 0.25, 0);
    this.controls.update();
    this.controls.addEventListener('start', () => this.clearHover());

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#54705b', 1.2));
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.5);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.camera.right = keyLight.shadow.camera.top = 6;
    keyLight.shadow.normalBias = 0.025;
    this.scene.add(keyLight);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshStandardMaterial({ color: '#e7efe9', roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.15;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.floor = floor;

    this.renderer.domElement.addEventListener('pointerdown', (event) => {
      this.downPoint = { x: event.clientX, y: event.clientY };
      this.clearHover();
    });
    this.renderer.domElement.addEventListener('pointerup', (event) => this.pickZone(event));
    this.renderer.domElement.addEventListener('pointermove', (event) => {
      if (event.buttons || event.pointerType === 'touch') return;
      this.pendingPointer = { clientX: event.clientX, clientY: event.clientY };
    });
    this.renderer.domElement.addEventListener('pointerleave', () => this.clearHover());
    this.renderer.domElement.addEventListener('pointercancel', () => {
      this.downPoint = undefined;
      this.clearHover();
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvasHost.nativeElement);
    this.rebuildModel();
    this.resize();
    this.render();
  }

  private rebuildModel(): void {
    this.clearHover();
    const version = ++this.modelVersion;
    for (const object of [...this.scene.children])
      if (object.userData['inspectionModel']) {
        this.scene.remove(object);
        this.disposeObject(object);
      }
    this.zoneMeshes.clear();
    const root = new THREE.Group();
    root.userData['inspectionModel'] = true;
    this.scene.add(root);
    const motorcycle = this.motorcycle;
    this.status = 'Cargando modelo 3D…';
    new GLTFLoader().load(
      `models/${motorcycle ? 'inspection-motorcycle' : 'inspection-suv'}.glb`,
      (gltf) => {
        if (this.destroyed || version !== this.modelVersion) {
          this.disposeObject(gltf.scene);
          return;
        }
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 6 / bounds.getSize(new THREE.Vector3()).z;
        gltf.scene.position.set(-center.x * scale, -bounds.min.y * scale - 1.05, -center.z * scale);
        gltf.scene.scale.setScalar(scale);
        gltf.scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.castShadow = true;
          const zone = object.userData['zone'] as VehicleZone | undefined;
          if (!zone) return;
          // glTF shares materials: clone per mesh so marking one zone does not mark all paint.
          object.material = Array.isArray(object.material)
            ? object.material.map((material) => material.clone())
            : object.material.clone();
          this.rememberEmission(object);
          const meshes = this.zoneMeshes.get(zone) ?? [];
          meshes.push(object);
          this.zoneMeshes.set(zone, meshes);
        });
        root.add(gltf.scene);
        const modelBounds = new THREE.Box3().setFromObject(root);
        this.modelCenter.copy(modelBounds.getCenter(new THREE.Vector3()));
        // Fit projected corners, not a bounding sphere (which makes narrow bikes tiny).
        const direction = new THREE.Vector3(-1, 0.62, -1.15).normalize();
        const right = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
        const up = new THREE.Vector3().crossVectors(direction, right);
        const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
        this.fitDistance = 0;
        for (const x of [modelBounds.min.x, modelBounds.max.x])
          for (const y of [modelBounds.min.y, modelBounds.max.y])
            for (const z of [modelBounds.min.z, modelBounds.max.z]) {
              const corner = new THREE.Vector3(x, y, z).sub(this.modelCenter);
              const depth = corner.dot(direction);
              this.fitDistance = Math.max(
                this.fitDistance,
                Math.abs(corner.dot(up)) / tanV + depth,
                Math.abs(corner.dot(right)) / (tanV * this.camera.aspect) + depth,
              );
            }
        this.fitDistance *= 1.12;
        this.controls!.maxDistance = Math.max(24, this.fitDistance * 1.5);
        this.resetView();
        this.paintSelection();
        this.zone.run(() => {
          this.status = `${motorcycle ? 'Moto genérica' : 'SUV genérico'} · pasa el cursor para identificar las piezas`;
          this.cdr.markForCheck();
        });
      },
      undefined,
      () => {
        if (this.destroyed || version !== this.modelVersion) return;
        if (motorcycle) this.addMotorcycle(root);
        else this.addCar(root);
        this.paintSelection();
        this.zone.run(() => {
          this.status = 'No se pudo cargar el modelo detallado. Vista esquemática disponible.';
          this.cdr.markForCheck();
        });
      },
    );
    this.paintSelection();
    this.resetView();
  }

  private addCar(root: THREE.Group): void {
    const paint = new THREE.MeshStandardMaterial({
      color: '#216a46',
      metalness: 0.45,
      roughness: 0.28,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: '#17221d',
      metalness: 0.25,
      roughness: 0.38,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: '#6fa9b0',
      metalness: 0.5,
      roughness: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    this.part(
      root,
      new THREE.BoxGeometry(3.2, 0.8, 6.2, 5, 2, 6),
      paint,
      'habitaculo',
      0,
      -0.05,
      0,
    );
    this.part(
      root,
      new THREE.BoxGeometry(2.85, 0.85, 3.35, 4, 2, 4),
      glass,
      'habitaculo',
      0,
      0.72,
      -0.25,
    );
    this.part(root, new THREE.BoxGeometry(3.15, 0.65, 0.7), paint, 'delantera', 0, -0.12, -3.25);
    this.part(root, new THREE.BoxGeometry(3.15, 0.65, 0.7), paint, 'trasera', 0, -0.12, 3.25);
    this.part(
      root,
      new THREE.BoxGeometry(0.22, 0.56, 3.5),
      paint,
      'lateralIzquierdo',
      -1.66,
      0.03,
      0,
    );
    this.part(root, new THREE.BoxGeometry(0.22, 0.56, 3.5), paint, 'lateralDerecho', 1.66, 0.03, 0);
    this.part(root, new THREE.BoxGeometry(2.4, 0.22, 5.4), dark, 'parteInferior', 0, -0.63, 0);
    const wheelGeometry = new THREE.CylinderGeometry(0.72, 0.72, 0.34, 24);
    wheelGeometry.rotateZ(Math.PI / 2);
    this.part(root, wheelGeometry, dark, 'ruedaDelIzq', -1.72, -0.57, -2.05);
    this.part(root, wheelGeometry.clone(), dark, 'ruedaDelDer', 1.72, -0.57, -2.05);
    this.part(root, wheelGeometry.clone(), dark, 'ruedaTraIzq', -1.72, -0.57, 2.05);
    this.part(root, wheelGeometry.clone(), dark, 'ruedaTraDer', 1.72, -0.57, 2.05);
  }

  private addMotorcycle(root: THREE.Group): void {
    const paint = new THREE.MeshStandardMaterial({
      color: '#216a46',
      metalness: 0.45,
      roughness: 0.28,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: '#17221d',
      metalness: 0.25,
      roughness: 0.38,
    });
    this.part(root, new THREE.BoxGeometry(1.1, 0.45, 3.6), dark, 'chasis', 0, -0.35, 0);
    this.part(
      root,
      new THREE.SphereGeometry(0.9, 24, 16),
      paint,
      'lateralIzquierdo',
      -0.3,
      0.3,
      -0.1,
    );
    this.part(root, new THREE.SphereGeometry(0.9, 24, 16), paint, 'lateralDerecho', 0.3, 0.3, -0.1);
    this.part(root, new THREE.BoxGeometry(1.15, 0.35, 1.3), dark, 'chasis', 0, 0.45, 1.1);
    this.part(root, new THREE.BoxGeometry(1.05, 0.55, 0.55), paint, 'delantera', 0, 0.12, -2.05);
    this.part(root, new THREE.BoxGeometry(1.05, 0.4, 0.55), paint, 'trasera', 0, 0.12, 2.05);
    const wheel = new THREE.TorusGeometry(0.72, 0.2, 14, 28);
    wheel.rotateY(Math.PI / 2);
    this.part(root, wheel, dark, 'ruedaDelantera', 0, -0.55, -2.2);
    this.part(root, wheel.clone(), dark, 'ruedaTrasera', 0, -0.55, 2.15);
  }

  private part(
    root: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    zone: VehicleZone,
    x: number,
    y: number,
    z: number,
  ): void {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.userData['zone'] = zone;
    this.rememberEmission(mesh);
    root.add(mesh);
    const meshes = this.zoneMeshes.get(zone) ?? [];
    meshes.push(mesh);
    this.zoneMeshes.set(zone, meshes);
  }

  private pickZone(event: PointerEvent): void {
    const down = this.downPoint;
    this.downPoint = undefined;
    if (
      !down ||
      Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6 ||
      !this.renderer ||
      event.button !== 0
    )
      return;
    const hit = this.hitPart(event);
    const selected = hit?.userData['zone'] as VehicleZone | undefined;
    if (selected) this.zone.run(() => this.zoneToggled.emit(selected));
    if (selected && event.pointerType !== 'touch') {
      this.pendingPointer = { clientX: event.clientX, clientY: event.clientY };
    }
  }

  private hitPart(event: { clientX: number; clientY: number }): THREE.Mesh | undefined {
    if (!this.renderer) return undefined;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return undefined;
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects([...this.zoneMeshes.values()].flat(), false)[0];
    return hit?.object as THREE.Mesh | undefined;
  }

  private updateHover(event: { clientX: number; clientY: number }): void {
    const mesh = this.hitPart(event);
    if (!mesh) {
      this.clearHover();
      return;
    }
    const changed = this.hoveredMesh !== mesh;
    this.hoveredMesh = mesh;
    if (changed) this.paintSelection();
    const zone = mesh.userData['zone'] as VehicleZone;
    const rect = this.canvasHost.nativeElement.getBoundingClientRect();
    const position = tooltipPosition(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
    );
    this.zone.run(() => {
      this.hoveredPart = {
        label: partLabel(mesh.userData['partLabel'], zone),
        location: ZONE_LABELS[zone],
        selected: this.selectedZones.includes(zone),
        ...position,
      };
      this.cdr.markForCheck();
    });
    this.canvasHost.nativeElement.style.cursor = 'pointer';
  }

  clearHover(): void {
    this.pendingPointer = undefined;
    if (this.hoveredMesh) {
      this.hoveredMesh = undefined;
      this.paintSelection();
    }
    if (this.canvasHost) this.canvasHost.nativeElement.style.cursor = '';
    if (!this.hoveredPart) return;
    this.zone.run(() => {
      this.hoveredPart = undefined;
      this.cdr.markForCheck();
    });
  }

  private rememberEmission(mesh: THREE.Mesh): void {
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (material instanceof THREE.MeshStandardMaterial) {
        this.baseEmission.set(material, {
          color: material.emissive.clone(),
          intensity: material.emissiveIntensity,
        });
      }
    }
  }

  private paintSelection(): void {
    for (const [zone, meshes] of this.zoneMeshes)
      for (const mesh of meshes) {
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue;
          const selected = this.selectedZones.includes(zone);
          const base = this.baseEmission.get(material);
          if (selected || mesh === this.hoveredMesh) {
            material.emissive.set(selected ? '#bd1e31' : '#8bbd91');
            material.emissiveIntensity = selected ? 0.55 : 0.28;
          } else {
            material.emissive.copy(base?.color ?? new THREE.Color(0));
            material.emissiveIntensity = base?.intensity ?? 0;
          }
        }
      }
  }

  private disposeObject(root: THREE.Object3D): void {
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        material.dispose();
    });
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.canvasHost.nativeElement;
    if (!this.renderer || !width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private render = (): void => {
    this.animationId = requestAnimationFrame(this.render);
    this.controls?.update();
    if (this.pendingPointer) {
      const pointer = this.pendingPointer;
      this.pendingPointer = undefined;
      this.updateHover(pointer);
    }
    if (this.floor) this.floor.visible = this.camera.position.y >= -1;
    this.renderer?.render(this.scene, this.camera);
  };
}
