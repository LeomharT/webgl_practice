import { Colors } from '@blueprintjs/colors';
import {
  Color,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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
camera.position.set(0, 0, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const dayMapTexture = textureLoader.load('/2k_earth_daymap.jpg');

// WORLD

const uniforms = {
  uSize: new Uniform(0.02),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uDayMapTexture: new Uniform(dayMapTexture),
};

const sphereGeometry = new PlaneGeometry(2 * 1.678, 2, 64, 64);
const pointMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const points = new Points(sphereGeometry, pointMaterial);
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
