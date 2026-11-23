import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  atan,
  cameraPosition,
  color,
  Fn,
  HALF_PI,
  instancedBufferAttribute,
  materialColor,
  mix,
  positionLocal,
  reflector,
  rotate,
  uv,
} from 'three/tsl';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  InstancedBufferAttribute,
  MathUtils,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Timer,
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
renderer.autoClear = true;
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 1, 1);
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
const floorMaterial = new MeshStandardNodeMaterial({
  roughness: 0.4,
  metalness: 0.3,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;

floorMaterial.colorNode = Fn(() => {
  const color = materialColor.add(
    reflector({
      resolutionScale: 1,
      target: floor,
      bounces: true,
      generateMipmaps: false,
    }),
  );

  return color;
})();

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

const grassMaterial = new MeshBasicNodeMaterial({
  color: new Color(Colors.GREEN4),
});

const count = 1000;

const positionArray = new Float32Array(count * 3);
const positionBuffer = new InstancedBufferAttribute(positionArray, 3);

const scaleArray = new Float32Array(count * 3);
const scaleBuffer = new InstancedBufferAttribute(scaleArray, 3);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;

  positionArray[i3 + 0] = MathUtils.randFloat(-0.5, 0.5);
  positionArray[i3 + 1] = 0;
  positionArray[i3 + 2] = MathUtils.randFloat(-0.5, 0.5);

  scaleArray[i3 + 0] = 0.1;
  scaleArray[i3 + 1] = 0.1;
  scaleArray[i3 + 2] = 0.1;
}

grassMaterial.positionNode = Fn(() => {
  const position = instancedBufferAttribute(
    positionBuffer,
    'vec3',
  ) as Node<'vec3'>;
  const scale = instancedBufferAttribute(scaleBuffer, 'vec3') as Node<'vec3'>;

  // Rotate
  const angle = atan(
    cameraPosition.z.sub(position.z),
    cameraPosition.x.sub(position.x),
  ).sub(HALF_PI);

  positionLocal.xz.assign(rotate(positionLocal.xz, angle));
  // Scale
  positionLocal.mulAssign(scale);
  // Translate
  positionLocal.addAssign(position);

  return positionLocal;
})();

grassMaterial.colorNode = Fn(() => {
  const diffuse = mix(color(Colors.GREEN1), color(Colors.GREEN5), uv().y);
  return diffuse;
})();

const grass = new Mesh(grassGeometry, grassMaterial);
grass.count = count;
scene.add(grass);

// Lights
const ambientLight = new AmbientLight(Colors.BLUE1, 2);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(Colors.WHITE, 3);
directionalLight.position.set(3, 3, 3);
scene.add(directionalLight);

// Tick function
function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
