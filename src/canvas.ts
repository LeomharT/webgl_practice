import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { GPUComputationRenderer, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const textureLoader = new TextureLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const dayMapTexture = textureLoader.load('/2k_earth_daymap.jpg');

// WORLD

const baseGeometry = {
  instance: new SphereGeometry(3),
  count: 0,
};
baseGeometry.count = baseGeometry.instance.attributes.position.count;

console.log(baseGeometry);

/**
 * GPU Compute
 */

const c = new GPUComputationRenderer(sizes.width, sizes.height, renderer);
const gpgpu = {};

const particles = {};

const uniforms = {
  uSize: new Uniform(0.2),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uDayMapTexture: new Uniform(dayMapTexture),
};

const pointMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const points = new Points(baseGeometry.instance, pointMaterial);
scene.add(points);

const pane = new Pane({ title: 'Debug Pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: 'fps',
});
pane.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  min: 0,
  max: 1,
  step: 0.01,
});

// EVENTS

function render() {
  fpsGraph.begin();

  controls.update();
  //
  renderer.render(scene, camera);
  //
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  uniforms.uResolution.value.set(sizes.width, sizes.height);
  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
