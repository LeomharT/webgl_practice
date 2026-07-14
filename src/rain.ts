import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Timer,
  TorusGeometry,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import {
  EffectComposer,
  OrbitControls,
  OutputPass,
  Reflector,
  RenderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
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

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.1, 0.2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// POST PROGRESS
const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(sizes.pixelRatio);
composer.renderToScreen = true;

const renderScene = new RenderPass(scene, camera);
const outputPass = new OutputPass();

const bloomPass = new UnrealBloomPass(new Vector2(sizes.width, sizes.height), 0.93, 0.44, 0.15);

composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// TEXTURE
const normalTexture = textureLoader.load('normal.png');
const roughnessTexture = textureLoader.load('roughness.jpg');
const opacityTexture = textureLoader.load('opacity.jpg');

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
  // SIMPLER 2D
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uNormalTexture: new Uniform(normalTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),
  uOpacityTexture: new Uniform(opacityTexture),
  // MATRIX
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,
  // FLOAT
  uTime: new Uniform(0),
  uDistortionAmout: new Uniform(0.1286),
  uBlurStrength: new Uniform(6.258),
  uRippleScale: new Uniform(18.125),
  // Vector
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
};
uniforms.uReflectorTexture.value.generateMipmaps = true;
uniforms.uReflectorTexture.value.minFilter = NearestMipMapNearestFilter;

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
const ringGeometry = new TorusGeometry(0.1, 0.003, 12, 64);
const ringMaterial = new MeshBasicMaterial({
  color: new Color(Colors.TURQUOISE3),
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

const f_floor = pane.addFolder({ title: 'Floor' });
f_floor.addBinding(uniforms.uRippleScale, 'value', {
  label: 'Ripple Scale',
  step: 0.1,
  min: 0,
  max: 20,
});
f_floor.addBinding(uniforms.uDistortionAmout, 'value', {
  label: 'Distortion Amount',
  step: 0.001,
  min: 0,
  max: 1,
});
f_floor.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  step: 0.001,
  min: 0,
  max: 15,
});

const f_bloom = pane.addFolder({ title: 'Bloom' });
f_bloom.addBinding(bloomPass, 'strength', {
  min: 0,
  max: 3,
  step: 0.01,
});
f_bloom.addBinding(bloomPass, 'radius', {
  min: 0,
  max: 1,
  step: 0.01,
});
f_bloom.addBinding(bloomPass, 'threshold', {
  min: 0,
  max: 1,
  step: 0.01,
});

const f_ring = pane.addFolder({ title: 'Ring' });
f_ring.addBinding(ringMaterial, 'color', {
  color: { type: 'float' },
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
  const dt = timer.getDelta();

  uniforms.uTime.value += dt;
  controls.update();
  updateReflection();
  // RENDER
  composer.render();
  // ANIMATION
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);
  composer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
