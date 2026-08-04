import { Colors } from '@blueprintjs/colors';
import {
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { GPUComputationRenderer, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

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

const baseGeometry = (function () {
  const geometry = new SphereGeometry(3);
  const count = geometry.attributes.position.count;

  return {
    instance: geometry,
    count,
  };
})();

/**
 * GPU Compute
 */

const c = new GPUComputationRenderer(sizes.width, sizes.height, renderer);
const gpgpu = {};

const particles = {};

const uniforms = {
  uSize: new Uniform(0.02),
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
pane.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  min: 0,
  max: 1,
  step: 0.01,
});

// EVENTS

function render() {
  controls.update();
  //
  renderer.render(scene, camera);
  //
  requestAnimationFrame(render);
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
