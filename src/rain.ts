import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  TorusGeometry,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
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
camera.position.set(0, 0.1, 0.2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// WORLD
const planeGeometry = new PlaneGeometry(1, 1, 64, 64);

const floorReflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
  clipBias: 0.003,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.visible = false;
scene.add(floorReflector);

const uniforms = {
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,
};

// Floor
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const floor = new Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Ring
const ringGeometry = new TorusGeometry(0.1, 0.005, 12, 64);
const ringMaterial = new MeshBasicMaterial({
  color: new Color(Colors.VIOLET3),
});
const ring = new Mesh(ringGeometry, ringMaterial);
scene.add(ring);

// PANE
const pane = new Pane({ title: 'Debug Pane' });
pane.element.parentElement!.style.width = '380px';
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3,
});

function updateReflection() {
  floorReflector.visible = true;
  renderer.render(scene, camera);
  floorReflector.visible = false;
}

function render() {
  fpsGraph.begin();

  // UPDATE
  timer.update();
  controls.update();

  updateReflection();
  // RENDER
  renderer.render(scene, camera);
  // ANIMATION
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
