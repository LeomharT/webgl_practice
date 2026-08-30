import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(0x000000);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0.2, 0.3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD

const pleneGeometry = new PlaneGeometry(1, 1, 32, 32);
const planeMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
});
const floor = new Mesh(pleneGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;

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
