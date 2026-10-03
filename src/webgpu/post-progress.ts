import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  AxesHelper,
  Color,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
CameraControls.install({ THREE: await import('three') });

const gltfLoader = new GLTFLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root');

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(2, 4, 8);
camera.lookAt(scene.position);

const inspector = new Inspector();
renderer.inspector = inspector;

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.8;

const timer = new Timer();

// Scene
const axesHelper = new AxesHelper();
scene.add(axesHelper);

function render() {
  // UPDATE
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // RENDER
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
