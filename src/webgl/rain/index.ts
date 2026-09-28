import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import {
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  NearestMipmapNearestFilter,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Timer,
  Uniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
  type IUniform,
} from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

CameraControls.install({ THREE: await import('three') });

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
renderer.setClearColor(0x000000);
el?.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(0, 0.2, 0.3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.dollySpeed = 0.8;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;

const timer = new Timer();

const frameRenderTarget = new WebGLRenderTarget(sizes.width, sizes.height, {
  generateMipmaps: true,
  minFilter: NearestMipMapNearestFilter,
  magFilter: NearestFilter,
});

const opacityTexture = textureLoader.load('opacity.jpg');
const normalTexture = textureLoader.load('normal.png');
const roughnessTexture = textureLoader.load('roughness.jpg');

const floorGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorReflector = new Reflector(floorGeometry, {
  textureWidth: sizes.width * sizes.pixelRatio,
  textureHeight: sizes.height * sizes.pixelRatio,
});
floorReflector.visible = false;
floorReflector.rotation.x = -Math.PI / 2;
const reflectorMaterial = floorReflector.material as ShaderMaterial;
scene.add(floorReflector);

const uniforms = {
  uTime: new Uniform(0),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uTextureMatrix: reflectorMaterial.uniforms.textureMatrix,
  uReflectorTexture: reflectorMaterial.uniforms.tDiffuse as IUniform<Texture>,
  uNormalTexture: new Uniform(normalTexture),
  uOpacityTexture: new Uniform(opacityTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),
  uBlurStrength: new Uniform(0.124),
  uNormalBias: new Uniform(0.6),
};
uniforms.uReflectorTexture.value.generateMipmaps = true;
uniforms.uReflectorTexture.value.minFilter = NearestMipmapNearestFilter;

const floorMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const sphereGeometry = new IcosahedronGeometry(0.1, 32);
const sphereMaterial = new MeshBasicMaterial({
  color: Colors.BLUE3,
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = 1;
scene.add(sphere);

const pane = new Pane({ title: 'Debug Params' });
pane.addBinding(sphereMaterial, 'color', {
  color: { type: 'float' },
});

pane.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  step: 0.1,
  min: 1,
  max: 20,
});
pane.addBinding(uniforms.uNormalBias, 'value', {
  label: 'Normal Bias',
  step: 0.1,
  min: 0,
  max: 1,
});
function renderScene() {
  renderer.setRenderTarget(frameRenderTarget);
  floorReflector.visible = true;
  renderer.render(scene, camera);
  floorReflector.visible = false;
  renderer.setRenderTarget(null);
}

function render() {
  // UPDATE
  timer.update();
  const dt = timer.getDelta();

  const t = 1.0 - Math.exp(-5.0 * dt);
  sphere.position.y = MathUtils.lerp(sphere.position.y, 0.1, t);

  controls.update(dt);
  uniforms.uTime.value += dt;
  // RENDER
  renderScene();
  renderer.render(scene, camera);
  // ANIMATION
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
