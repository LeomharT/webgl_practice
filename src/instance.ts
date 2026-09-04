import { Colors } from '@blueprintjs/colors';
import {
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0.2, 0.3, 0.3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const floorGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorMaterial = new MeshBasicMaterial({ color: 0x000000 });
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;

const maxCount = 3000;

const positionArr = new Float32Array([
  // v1
  1.0, 0.0, 0.0,
  // v2
  0.0, 1.0, 0.0,
  // v3
  -1.0, 0.0, 0.0,
]);
const uvArr = new Float32Array([
  // v1
  1.0, 0.0,
  // v2
  0.5, 1.0,
  // v3
  0.0, 0.0,
]);

const uniforms = {
  uColor: new Uniform(new Color('#7CFC00')),
};

const grassbladeGeometry = new BufferGeometry();
const grassbladeMaterial = new ShaderMaterial({
  uniforms,
});

const grass = new Mesh(grassbladeGeometry, grassbladeMaterial);
scene.add(grass);

scene.add(floor);

function render() {
  // UPDATE
  controls.update();
  // RENDER
  renderer.render(scene, camera);
  // ANIMATION
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
