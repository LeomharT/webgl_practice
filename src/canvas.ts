import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Uniform,
  WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const textureLoader = new TextureLoader();

const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/draco/');
dracoloader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoloader);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const dayMap = textureLoader.load('2k_earth_daymap.jpg');
dayMap.colorSpace = SRGBColorSpace;

const normalTexture = textureLoader.load('normal.png');
const roughnessTexture = textureLoader.load('roughness.jpg');

// Basic
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(0x000000);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.5, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD
const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorReflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.visible = false;
scene.add(floorReflector);

const uniforms = {
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,

  uNormalTexture: new Uniform(normalTexture),
};

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const floor = new Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ball = new Mesh(new IcosahedronGeometry(0.05, 5), new MeshBasicMaterial({ color: Colors.VIOLET3 }));
ball.position.y = 0.1;
scene.add(ball);

const pane = new Pane({ title: 'Debug Pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
});

function renderReflection() {
  floorReflector.visible = true;
  renderer.render(scene, camera);
  floorReflector.visible = false;
}

function render() {
  fpsGraph.begin();
  // Update
  controls.update();
  // Render
  renderReflection();
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
