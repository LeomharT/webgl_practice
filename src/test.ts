import { Colors } from '@blueprintjs/colors';
import {
  Color,
  FrontSide,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const el = document.querySelector('#root');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

// BASIC
const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#000');

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0.1, 0.5, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const frameRT = new WebGLRenderTarget(sizes.width, sizes.height, {
  generateMipmaps: false,
});

// WORLD
const floorGeometry = new PlaneGeometry(1, 1, 32, 32);

const floorReflector = new Reflector(floorGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
floorReflector.visible = false;
floorReflector.rotation.x = -Math.PI / 2;
scene.add(floorReflector);

const uniforms = {
  uRelfectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,
};

const floorMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: FrontSide,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ball = new Mesh(new IcosahedronGeometry(0.1, 30), new MeshBasicMaterial({ color: new Color(Colors.VERMILION2) }));
ball.position.y = 0.5;
scene.add(ball);

function renderReflector() {
  renderer.setRenderTarget(frameRT);
  floorReflector.visible = true;
  renderer.render(scene, camera);
  floorReflector.visible = false;
  renderer.setRenderTarget(null);
}

function render(time: number = 0) {
  // UPDATE
  controls.update();
  // RENDER
  renderReflector();
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
