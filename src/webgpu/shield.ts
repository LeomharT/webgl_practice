import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { distance, pass, texture, uv, vec2 } from 'three/tsl';
import {
  AxesHelper,
  Color,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RenderPipeline,
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
renderer.setAnimationLoop(render);

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
controls.dampingFactor = 0.02;

const timer = new Timer();

// Renderer pipeline
const renderPipeline = new RenderPipeline(renderer);

const scenePass = pass(scene, camera);
renderPipeline.outputNode = scenePass;

// World

const floorGeometry = new PlaneGeometry(10, 10, 1, 1);
const floorMaterial = new MeshBasicNodeMaterial({
  transparent: true,
});
floorMaterial.colorNode = texture(floorTexture, uv());
floorMaterial.opacityNode = distance(uv(), vec2(0.5))
  .smoothstep(0.2, 0.5)
  .oneMinus();

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;

scene.add(floor);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

function render() {
  // Update
  timer.update();

  const dt = timer.getDelta();
  controls.update(dt);

  // Render
  renderPipeline.render();
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
