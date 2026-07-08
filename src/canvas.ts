import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import {
  ACESFilmicToneMapping,
  AxesHelper,
  Color,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipMapLinearFilter,
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
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
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

//
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.725;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(0x000000);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.1, 0.35);
camera.lookAt(scene.position);

const controls1 = new OrbitControls(camera, renderer.domElement);
controls1.enableDamping = true;

const timer = new Timer();

const composer = new EffectComposer(renderer, { multisampling: 8 });
composer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
const bloomPass = new BloomEffect({
  width: window.innerWidth,
  height: window.innerHeight,
  radius: 0.5,
  intensity: 0.5,
  luminanceThreshold: 0.0,
});
composer.addPass(renderPass);
composer.addPass(new EffectPass(camera, bloomPass));

// Texture
const normalTexture = textureLoader.load('normal.png');
normalTexture.wrapT = normalTexture.wrapS = MirroredRepeatWrapping;

const roughnessTexture = textureLoader.load('roughness.jpg');
roughnessTexture.anisotropy = 8;
roughnessTexture.wrapT = roughnessTexture.wrapS = MirroredRepeatWrapping;

const opacityTexture = textureLoader.load('opacity.jpg');
opacityTexture.wrapT = opacityTexture.wrapS = MirroredRepeatWrapping;

// World

const planeGeometry = new PlaneGeometry(1, 1, 64, 64);

const floorReflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.0001;
scene.add(floorReflector);

const uniforms = {
  // Simpler2D
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uNormalTexture: new Uniform(normalTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),
  uOpacityTexture: new Uniform(opacityTexture),

  // Matrix
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,

  // Vector
  uResolution: new Uniform(sizes.resolution),

  // Float
  uTime: new Uniform(0),
  uRainScale: new Uniform(16.0),
  uNormalBais: new Uniform(0.1065),
  uBlurStrength: new Uniform(6.3),
};
uniforms.uReflectorTexture.value.generateMipmaps = true;
uniforms.uReflectorTexture.value.minFilter = NearestMipMapLinearFilter;
uniforms.uReflectorTexture.value.magFilter = NearestFilter;

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ballGeometry = new TorusGeometry(0.2, 0.01);
const ballMaterial = new MeshBasicMaterial({
  color: new Color('#ff5edc'),
});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.15;
scene.add(ball);

const axesHelper = new AxesHelper();
axesHelper.visible = false;
scene.add(axesHelper);

const pane = new Pane({ title: 'Debug Pane' });
pane.element.parentElement!.style.width = '380px';

const f_axes = pane.addFolder({ title: '🧊 Axes Helper' });
f_axes.addBinding(axesHelper, 'visible');

const f_ball = pane.addFolder({ title: '⚪ Ball' });
f_ball.addBinding(ballMaterial, 'color', {
  color: { type: 'float' },
});

const f_floor = pane.addFolder({ title: '⬜ Floor' });
f_floor.addBinding(uniforms.uRainScale, 'value', {
  label: 'Rain Scale',
  step: 0.1,
  min: 0,
  max: 30,
});
f_floor.addBinding(uniforms.uNormalBais, 'value', {
  label: 'Normal bais',
  step: 0.001,
  min: 0,
  max: 1,
});
f_floor.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  step: 0.1,
  min: 0,
  max: 20,
});

const f_bloom = pane.addFolder({ title: 'Bloom' });
f_bloom.addBinding(bloomPass, 'intensity', {
  step: 0.001,
  min: 0,
  max: 1,
});

function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();
  uniforms.uTime.value += dt;

  controls1.update();
  // Render
  composer.render();
  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.resolution.x = sizes.width;
  sizes.resolution.y = sizes.height;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
