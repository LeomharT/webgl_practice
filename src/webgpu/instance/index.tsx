import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { distance, texture, uv, vec2 } from 'three/tsl';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AxesHelper,
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
