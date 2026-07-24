import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import rainFragmentShader from './shader/test/rain/fragment.glsl?raw';
import rainVertexShader from './shader/test/rain/vertex.glsl?raw';

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
scene.background = new Color(Colors.DARK_GRAY1);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.5, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const frameRT = new WebGLRenderTarget(sizes.width, sizes.height, {
  generateMipmaps: true,
  minFilter: NearestMipMapNearestFilter,
});

// WORLD
const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorReflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.visible = false;
(floorReflector.material as ShaderMaterial).polygonOffset = true;
(floorReflector.material as ShaderMaterial).polygonOffsetFactor = 0.01;
scene.add(floorReflector);

const uniforms = {
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,

  uNormalTexture: new Uniform(normalTexture),
  uRoughnessTexture: new Uniform(roughnessTexture),

  uDisturbedAmount: new Uniform(0.125),
  uBlurStrength: new Uniform(6.125),
};
uniforms.uReflectorTexture.value.generateMipmaps = true;
uniforms.uReflectorTexture.value.minFilter = NearestMipMapNearestFilter;

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

const rain = new Mesh(
  new PlaneGeometry(0.2, 0.2, 32, 32),
  new ShaderMaterial({
    uniforms: {
      uFrameTexture: new Uniform(frameRT.texture),
    },
    vertexShader: rainVertexShader,
    fragmentShader: rainFragmentShader,
  }),
);
rain.position.set(0.2, 0.2, 0.2);
scene.add(rain);

const pane = new Pane({ title: 'Debug Pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
});

const p_floor = pane.addFolder({ title: 'Floor' });
p_floor.addBinding(uniforms.uDisturbedAmount, 'value', {
  min: 0,
  max: 1,
  step: 0.001,
});
p_floor.addBinding(uniforms.uBlurStrength, 'value', {
  min: 0,
  max: 20,
  step: 0.01,
});
function renderReflection() {
  floorReflector.visible = true;
  rain.visible = false;

  renderer.setRenderTarget(frameRT);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);

  rain.visible = true;
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
