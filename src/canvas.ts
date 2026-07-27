import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Timer,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
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
scene.background = new Color('#000000');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.2, 0.3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const normalTexture = textureLoader.load('/normal.png');
const roughnessTexture = textureLoader.load('/roughness.jpg');
const opacityTexture = textureLoader.load('/opacity.jpg');

const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const reflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
reflector.rotation.x = -Math.PI / 2;
(reflector.material as ShaderMaterial).polygonOffset = true;
(reflector.material as ShaderMaterial).polygonOffsetFactor = 0.04;
scene.add(reflector);

const uniforms = {
  // TEXTURES
  uNormalTexture: new Uniform(normalTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),
  uReflectorTexture: new Uniform(reflector.getRenderTarget().texture),
  uOpacityTexture: new Uniform(opacityTexture),
  // MATRIX
  uTextureMatrix: (reflector.material as ShaderMaterial).uniforms.textureMatrix,
  // FLOAT
  uTime: new Uniform(0.0),
  uDistributionAmount: new Uniform(0.2),
  uBlurStrength: new Uniform(3.25),
  uRainScale: new Uniform(16.0),
  // VERTOR
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
};
uniforms.uReflectorTexture.value.generateMipmaps = true;
uniforms.uReflectorTexture.value.minFilter = NearestMipMapNearestFilter;

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const sphereGeometry = new SphereGeometry(0.05, 32, 32);
const sphereMaterial = new MeshBasicMaterial({
  color: new Color(Colors.CERULEAN4),
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0.5, 0);
scene.add(sphere);

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);
// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3,
});

const f_floor = pane.addFolder({ title: 'Floor' });
f_floor.addBinding(uniforms.uRainScale, 'value', {
  label: 'Rain Scale',
  step: 0.01,
  min: 0,
  max: 20,
});
f_floor.addBinding(uniforms.uDistributionAmount, 'value', {
  label: 'Distribution Amount',
  step: 0.01,
  min: 0,
  max: 1,
});
f_floor.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  step: 0.01,
  min: 0,
  max: 15,
});

function render() {
  fpsGraph.begin();

  timer.update();
  controls.update();

  const delta = timer.getDelta();
  const t = 1.0 - Math.exp(2.0 * -delta);

  uniforms.uTime.value += delta;

  sphere.position.y = MathUtils.lerp(sphere.position.y, 0.1, t);

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
