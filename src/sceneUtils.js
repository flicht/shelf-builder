import * as THREE from "three";

/** Warm off-white that matches the app background (--bg in index.css). */
export const SCENE_BACKGROUND = 0xf3efe8;

const birchTextures = new Map();

/** Birch plywood texture, loaded once per repeat value and shared between materials. */
export function getBirchTexture(repeat = 1) {
  if (!birchTextures.has(repeat)) {
    const texture = new THREE.TextureLoader().load(`${process.env.PUBLIC_URL}/birch-p.jpg`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    birchTextures.set(repeat, texture);
  }
  return birchTextures.get(repeat);
}

/** Plywood-looking material. `tint` darkens or shifts the base colour. */
export function plywoodMaterial({ tint = 0xffffff, repeat = 1, opacity = 1 } = {}) {
  const map = getBirchTexture(repeat);
  return new THREE.MeshStandardMaterial({
    map,
    color: tint,
    roughness: 0.85,
    metalness: 0,
    transparent: opacity < 1,
    opacity,
  });
}

/** Soft studio lighting: sky/ground fill plus one key light with shadows. */
export function addStudioLights(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9cdb8, 0.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(1, 2, 1.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-2, 1, -1);
  scene.add(fill);

  return [hemi, key, fill];
}

/**
 * Positions the camera so `object` fills the view, and points the controls at
 * its centre. Returns the bounding sphere radius so callers can decide whether
 * a refit is needed.
 */
export function fitCameraToObject(camera, controls, object, { padding = 1.15, direction = [1, 0.6, 1.4] } = {}) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return 0;
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = (sphere.radius * padding) / Math.sin(fov / 2);
  const dir = new THREE.Vector3(...direction).normalize();

  camera.position.copy(sphere.center).addScaledVector(dir, distance);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();

  controls.target.copy(sphere.center);
  controls.minDistance = sphere.radius * 0.5;
  controls.maxDistance = distance * 4;
  controls.update();
  return sphere.radius;
}

/**
 * Keeps a renderer + camera sized to its container. Returns a disposer.
 */
export function observeResize(container, renderer, camera, onResize) {
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (onResize) onResize();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  return () => observer.disconnect();
}

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(SCENE_BACKGROUND);
  return renderer;
}

/** Disposes geometries and materials under `root` and empties it. */
export function disposeChildren(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m.dispose()); // textures are shared, so leave them alive
    }
  });
  root.clear();
}
