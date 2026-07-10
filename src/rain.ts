import { Colors } from '@blueprintjs/colors';
import * as TweakpaneEssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  TorusGeometry,
  Uniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { EffectComposer, OrbitControls, OutputPass, Reflector, RenderPass } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import { PackedMipMapGenerator } from './lib/custom-mipmap-generation/PackedMipMapGenerator';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
  resolution: new Vector2(window.innerWidth, window.innerHeight),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();

// Basic
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0.1, 0.2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;

const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(sizes.pixelRatio);

const renderPass = new RenderPass(scene, camera);
const outputPass = new OutputPass();

composer.addPass(renderPass);
composer.addPass(outputPass);

const nearestTarget = new WebGLRenderTarget();
nearestTarget.texture.minFilter = NearestFilter;
nearestTarget.texture.magFilter = NearestFilter;

const normalTexture = textureLoader.load('normal.png');
const roughnessTexture = textureLoader.load('roughness.jpg');
const opacityTexture = textureLoader.load('opacity.jpg');

// World
const floorGeometry = new PlaneGeometry(1, 1, 32, 32);

const floorReflector = new Reflector(floorGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
  clipBias: 0.003,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.0001;
floorReflector.getRenderTarget().texture.generateMipmaps = false;
scene.add(floorReflector);

const uniforms = {
  // Simpler
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uNormalTexture: new Uniform(normalTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),
  uOpacityTexture: new Uniform(opacityTexture),

  // Vector
  uResolution: new Uniform(sizes.resolution),

  // Matrix
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,

  // Float
  uDistortionAmount: new Uniform(0.1065),
  uBlurStrength: new Uniform(5.894),
};

const floorMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ringGeometry = new TorusGeometry(0.1, 0.005);
const ringMaterial = new MeshBasicMaterial({
  color: new Color('#ff5edc'),
});
const ring = new Mesh(ringGeometry, ringMaterial);
scene.add(ring);

// Pane
const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(TweakpaneEssentialsPlugin);
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3,
  min: 30,
  max: 80,
});
const f_floor = pane.addFolder({ title: '⬜ Floor' });
f_floor.addBinding(uniforms.uDistortionAmount, 'value', {
  label: 'Distortion Amount',
  min: 0,
  max: 1,
  step: 0.001,
});
f_floor.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  min: 0,
  max: 30,
  step: 0.001,
});
const mipMapper = new PackedMipMapGenerator();

function updateTexture() {
  // render mip pyramids
  mipMapper.update(floorReflector.getRenderTarget().texture, nearestTarget, renderer);

  // render original target
  const copyQuad = mipMapper._copyQuad;
  (copyQuad.material as ShaderMaterial).uniforms.tDiffuse.value = floorReflector.getRenderTarget().texture;
  copyQuad.camera.setViewOffset(1, 1, 0, 0, 1, 1);

  renderer.setRenderTarget(null);

  // dipose
  mipMapper.dispose();
}

function render() {
  fpsGraph.begin();

  // Update
  updateTexture();
  controls.update();

  // Render
  composer.render();
  // Animation
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.resolution.x = sizes.width;
  sizes.resolution.y = sizes.height;

  uniforms.uResolution.value.copy(sizes.resolution);

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
