import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  distance,
  positionLocal,
  sin,
  texture,
  time,
  uv,
  vec2,
} from 'three/tsl';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';

CameraControls.install({ THREE: await import('three') });

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

const floorTexture = textureLoader.load('floor-color.jpg');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.setAnimationLoop(render);

const canvas = renderer.domElement;

const inspector = new Inspector({});
renderer.inspector = inspector;

document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.25;

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;

const timer = new Timer();

const floorGeometry = new PlaneGeometry(10, 10, 1, 1);
const floorMaterial = new MeshStandardNodeMaterial({
  transparent: true,
});
floorMaterial.colorNode = texture(floorTexture, uv());
floorMaterial.opacityNode = distance(uv(), vec2(0.5))
  .smoothstep(0.2, 0.5)
  .oneMinus();

const floor = new Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.renderOrder = -1;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Common
const count = 4;

// Geometry
const geometry = new BoxGeometry(0.5, 1, 0.5, 12, 12, 12);

// Material
const material = new MeshStandardNodeMaterial();

// Wave
const wave = sin(time.add(positionLocal.y.mul(3))).mul(0.4);

/**
 * Method 1
 * Without instance
 */

// material.positionNode = Fn(() => {
//   positionLocal.z.addAssign(wave);
//   return positionLocal;
// })();

// for (let i = 0; i < count; i++) {
//   const mesh = new Mesh(geometry, material);
//   mesh.castShadow = true;
//   mesh.receiveShadow = true;
//   scene.add(mesh);

//   const progress = i / (count - 1);
//   mesh.position.x = (progress - 0.5) * count;
//   mesh.position.y = 1;
//   mesh.rotation.y = progress * 3;
// }

/**
 * Method 2
 * With Instance
 */
// material.positionNode = Fn(() => {
//   return positionLocal.add(wave);
// })();

// const mesh = new InstancedMesh(geometry, material, count);
// mesh.position.y = 1;
// mesh.castShadow = true;
// mesh.receiveShadow = true;
// scene.add(mesh);

// const dummy = new Matrix4();

// for (let i = 0; i < count; i++) {
//   const progress = i / (count - 1);

//   dummy.setPosition(new Vector3((progress - 0.5) * 4, 0, 0));
//   dummy.scale(new Vector3(1, 1, 1));

//   mesh.setMatrixAt(i, dummy);
//   mesh.updateMatrix();
// }

/**
 * Method 3
 * With `instanceIndex`
 */
// const countUniform = uniform(count);

// material.positionNode = Fn(({ object }) => {
//   const progress = instanceIndex.toFloat().div(countUniform.sub(1));

//   positionLocal.z.addAssign(wave);

//   // Rotation `do the rotation frist`
//   positionLocal.xz.assign(rotate(positionLocal.xz, progress.mul(3)));
//   normalLocal.xz.assign(rotate(normalLocal.xz, progress.mul(3)));

//   // Translation
//   positionLocal.x.addAssign(progress.sub(0.5).mul(countUniform));

//   return positionLocal;
// })();

// const mesh = new Mesh(geometry, material);
// mesh.count = count;
// mesh.position.y = 1;
// mesh.castShadow = true;
// mesh.receiveShadow = true;
// scene.add(mesh);

// Debug
// const instanceGui = inspector.createParameters('Instance');
// instanceGui.add(mesh, 'count', 1, 100, 1).onChange(() => {
//   countUniform.value = mesh.count;
// });

/**
 * Method 4
 * With `InstanceAttribute`
 */

// const rotationArray = new Float32Array(count);
// const positionArray = new Float32Array(count * 3);

// const rotationBuffer = new InstancedBufferAttribute(rotationArray, 1);
// const positionBuffer = new InstancedBufferAttribute(positionArray, 3);

// for (let i = 0; i < count; i++) {
//   const i3 = i * 3;
//   const progress = i / (count - 1);

//   positionArray[i3 + 0] = (progress - 0.5) * 4;
//   positionArray[i3 + 1] = 0;
//   positionArray[i3 + 2] = 0;

//   rotationArray[i] = progress * 3;
// }

// material.positionNode = Fn(() => {
//   // Buffer
//   const instanceRotation = instancedBufferAttribute(
//     rotationBuffer,
//   ) as unknown as Node<'float'>;

//   const instancePosition = instancedBufferAttribute(
//     positionBuffer,
//   ) as unknown as Node<'vec3'>;

//   // Rotation
//   positionLocal.xz.assign(rotate(positionLocal.xz, instanceRotation));
//   // Translation
//   positionLocal.addAssign(instancePosition);
//   // Wave
//   positionLocal.z.addAssign(wave);

//   return positionLocal;
// })();

// const mesh = new Mesh(geometry, material);
// mesh.count = count;
// mesh.position.y = 1;
// mesh.castShadow = true;
// mesh.receiveShadow = true;
// scene.add(mesh);

const ambientLight = new AmbientLight(0x859dff, 1.25);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffaf85, 3);
directionalLight.castShadow = true;
directionalLight.position.set(1, 1, 0.75);
directionalLight.shadow.radius = 5;
directionalLight.shadow.normalBias = 0.1;
scene.add(directionalLight);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

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

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
