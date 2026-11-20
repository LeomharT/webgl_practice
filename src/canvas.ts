import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  Mesh,
  MeshBasicNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
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
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 2, 1);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.dollySpeed = 0.25;
controls.maxDistance = 20;
controls.minDistance = 1;

const timer = new Timer();

/**
 * World
 */

const sphereGeometry = new SphereGeometry(1, 32, 32);
const sphereMaterial = new MeshBasicNodeMaterial({
  color: Colors.ROSE1,
});
const ball = new Mesh(sphereGeometry, sphereMaterial);

scene.add(ball);

// Tick function
function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);
}
