import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Spherical,
  TextureLoader,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

import { Colors } from '@blueprintjs/colors';
import { Pane } from 'tweakpane';
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
camera.position.set(0, 2, 2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD

const uniforms = {
  uTime: new Uniform(0),
  uSunDirection: new Uniform(new Vector3()),
};

const sunSpherical = new Spherical(1, Math.PI / 3, 0.5);
const sunPosition = new Vector3();

const sun = new Mesh(
  new IcosahedronGeometry(0.02, 3),
  new MeshBasicMaterial({ color: Colors.GOLD5 }),
);
function updateSun() {
  sunPosition.setFromSpherical(sunSpherical);

  uniforms.uSunDirection.value.copy(sunPosition.clone());

  sun.position.copy(sunPosition.clone().multiplyScalar(3));
}
updateSun();
scene.add(sun);

const sphereGeometry = new IcosahedronGeometry(1, 50);
const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});
const sphere = new Mesh(sphereGeometry, material);

scene.add(sphere);

const pane = new Pane({ title: 'Debug Params' });
pane
  .addBinding(sunSpherical, 'phi', {
    min: 0,
    max: Math.PI,
    step: 0.001,
  })
  .on('change', updateSun);
pane
  .addBinding(sunSpherical, 'theta', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.001,
  })
  .on('change', updateSun);

function render() {
  // UPDATE
  controls.update();
  uniforms.uTime.value += 0.01;
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
