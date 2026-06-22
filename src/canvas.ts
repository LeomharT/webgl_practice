import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  TextureLoader,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const textureLoader = new TextureLoader();

const dayMap = textureLoader.load('2k_earth_daymap.jpg');
dayMap.colorSpace = SRGBColorSpace;
dayMap.anisotropy = 8;

const nightMap = textureLoader.load('2k_earth_nightmap.jpg');
nightMap.colorSpace = SRGBColorSpace;
dayMap.anisotropy = 8;

const specularCloudTexture = textureLoader.load('specularClouds.jpg');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  piexelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.piexelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 0, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//
const uniforms = {
  uSunDirection: new Uniform(new Vector3()),

  uDayMapTexture: new Uniform(dayMap),
  uNightMapTexture: new Uniform(nightMap),
  uSpecularCloudTexture: new Uniform(specularCloudTexture),

  uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
  uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
};

const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
const sunDirection = new Vector3();

const sun = new Mesh(new IcosahedronGeometry(0.1, 3), new MeshBasicMaterial({ color: 'yellow' }));
scene.add(sun);

function updateSun() {
  sunDirection.setFromSpherical(sunSpherical);

  uniforms.uSunDirection.value.copy(sunDirection);

  sun.position.copy(sunDirection.clone().multiplyScalar(3));
}
updateSun();

const earchGeometry = new SphereGeometry(1, 64, 64);
const earchMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const earth = new Mesh(earchGeometry, earchMaterial);

scene.add(earth);

const pane = new Pane({ title: 'debug' });
pane
  .addBinding(sunSpherical, 'theta', {
    max: Math.PI,
    min: -Math.PI,
  })
  .on('change', updateSun);
pane
  .addBinding(sunSpherical, 'phi', {
    max: Math.PI,
    min: 0,
  })
  .on('change', updateSun);

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

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
