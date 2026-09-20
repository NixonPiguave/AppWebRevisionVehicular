import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const shared = ['delantera', 'trasera', 'lateralIzquierdo', 'lateralDerecho'];
for (const [name, zones] of [
  [
    'inspection-suv',
    [
      ...shared,
      'ruedaDelIzq',
      'ruedaDelDer',
      'ruedaTraIzq',
      'ruedaTraDer',
      'habitaculo',
      'parteInferior',
    ],
  ],
  ['inspection-motorcycle', [...shared, 'ruedaDelantera', 'ruedaTrasera', 'chasis']],
]) {
  const bytes = await readFile(new URL(`../public/models/${name}.glb`, import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    '',
  );
  const found = new Set();
  let meshes = 0,
    triangles = 0,
    metallicPaint = false;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((object) => {
    if (!object.isMesh) return;
    meshes++;
    const { zone, partLabel } = object.userData;
    assert(zones.includes(zone), `${name}: invalid zone ${zone}`);
    assert(typeof partLabel === 'string' && partLabel.length > 3, `${name}: missing label`);
    found.add(zone);
    const positions = object.geometry.attributes.position.array;
    assert(positions.every(Number.isFinite), `${name}: invalid coordinates`);
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (materials.some((mat) => mat.metalness > 0.7 && mat.clearcoat > 0.5)) metallicPaint = true;
  });
  assert.deepEqual([...found].sort(), [...zones].sort());
  assert(metallicPaint, `${name}: missing metallic clearcoat paint`);
  assert(triangles < 250000, `${name}: triangle budget exceeded`);
  assert(bytes.length < 8 * 1024 * 1024, `${name}: payload budget exceeded`);
  const bounds = new THREE.Box3().setFromObject(gltf.scene);
  const center = bounds.getCenter(new THREE.Vector3());
  const ray = new THREE.Raycaster(
    new THREE.Vector3(center.x, bounds.min.y - 2, center.z),
    new THREE.Vector3(0, 1, 0),
  );
  assert(
    ray.intersectObject(gltf.scene, true).some((hit) => hit.object.userData.zone),
    `${name}: underside not selectable`,
  );
  console.log(
    `${name}: ${meshes} meshes, ${triangles} triangles, ${(bytes.length / 1048576).toFixed(2)} MiB, ${found.size} zones; labels, materials and underside OK`,
  );
}
