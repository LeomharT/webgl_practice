import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  WebGLRenderer,
} from 'three';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';

CameraControls.install({ THREE: await import('three') });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;
controls.dollySpeed = 0.24;
controls.maxDistance = 20;

const timer = new Timer();

// World
const planeGeometry = new PlaneGeometry(5, 5, 1, 1);
const planeMaterial = new ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
});
const floor = new Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
