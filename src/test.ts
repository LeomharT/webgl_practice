import { Colors } from '@blueprintjs/colors';
import {
  Color,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.dracoLoader = dracoLoader;

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

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(3, 3, 8);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD

const sphereGeometry = new SphereGeometry(1, 32, 32);
const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
});
const sphere = new Mesh(sphereGeometry, material);
scene.add(sphere);

scene.add(sphere);

const pane = new Pane({ title: 'Debug Pane' });

// EVENTS
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
