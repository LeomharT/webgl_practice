import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  NearestMipMapLinearFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
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
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(0x000000);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0.45, 0.45);
camera.lookAt(scene.position);

const controls1 = new OrbitControls(camera, renderer.domElement);
controls1.enableDamping = true;

const timer = new Timer();

// Texture
const normalTexture = textureLoader.load('normal.png');
const roughnessTexture = textureLoader.load('roughness.jpg');

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

  // Matrix
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,

  // Vector
  uResolution: new Uniform(sizes.resolution),

  // Float
  uNormalBais: new Uniform(0.123),
  uBlurStrength: new Uniform(4.6),
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

const ballGeometry = new IcosahedronGeometry(0.08, 5);
const ballMaterial = new MeshBasicMaterial({
  color: new Color(Colors.ROSE3),
});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.2;
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

function render() {
  // Update
  timer.update();
  controls1.update();
  // Render
  renderer.render(scene, camera);
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
