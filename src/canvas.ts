import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { Fn, instance, positionLocal, rotate, time } from 'three/tsl';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  Timer,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu';

CameraControls.install({ THREE: await import('three/webgpu') });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, devicePixelRatio),
};

const inspector = new Inspector();

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.setAnimationLoop(render);
renderer.inspector = inspector;
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 1, 2);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.dollySpeed = 0.35;
controls.maxDistance = 20;
controls.minDistance = 1;

const timer = new Timer();

/**
 * World
 */

const floorGeometry = new PlaneGeometry(1, 1, 1, 1);
const floorMaterial = new MeshBasicNodeMaterial();
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;

scene.add(floor);

// Grass
const grassPositionArray = new Float32Array([
  0.0, 1.0, 0.0, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0,
]);
const grassUVArray = new Float32Array([0.5, 1.0, 0.0, 0.0, 1.0, 0.0]);

const grassGeometry = new BufferGeometry();
grassGeometry.setAttribute(
  'position',
  new BufferAttribute(grassPositionArray, 3),
);
grassGeometry.setAttribute('uv', new BufferAttribute(grassUVArray, 2));
grassGeometry.computeVertexNormals();

const count = 400;
const matrixArray = new Float32Array(count * 16);
const matrixBufferAttribute = new InstancedBufferAttribute(matrixArray, 16);

for (let i = 0; i < count; i++) {
  const translate = new Vector3(
    MathUtils.randFloat(-0.5, 0.5),
    0,
    MathUtils.randFloat(-0.5, 0.5),
  );
  const rotation = new Quaternion();
  const scale = new Vector3(1.0, 1.0, 1.0);

  const matrix = new Matrix4();
  matrix.compose(translate, rotation, scale);

  matrix.toArray(matrixArray, i * 16);
}

const grassMaterial = new MeshBasicNodeMaterial({
  color: new Color(Colors.GREEN3),
});
grassMaterial.positionNode = Fn(() => {
  instance(matrixBufferAttribute);
  positionLocal.xz.assign(rotate(positionLocal.xz, time.mul(0.1)));

  return positionLocal;
})();

const grass = new Mesh(grassGeometry, grassMaterial);
grass.count = count;
scene.add(grass);

// Tick function
function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);
}
