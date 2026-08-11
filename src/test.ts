import { Colors } from '@blueprintjs/colors';
import gsap from 'gsap';
import {
  Color,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import {
  DRACOLoader,
  EffectComposer,
  GLTFLoader,
  OrbitControls,
  OutputPass,
  RenderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;
(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.dracoLoader = dracoLoader;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(3, 3, 8);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// POST PROGRESSING
const composer = new EffectComposer(renderer);
composer.setSize(sizes.width, sizes.height);
composer.setPixelRatio(sizes.pixelRatio);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new Vector2(sizes.width, sizes.height), 0.5, 0.5, 0.5);
const outputPass = new OutputPass();

composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// WORLD

const uniforms = {
  uTime: new Uniform(0),
  uProgress: new Uniform(0.0),
};

const params = {
  y: 0,
  updating: false,
};

const sphereGeometry = new IcosahedronGeometry(2, 50);
const material = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const sphere = new Mesh(sphereGeometry, material);
scene.add(sphere);

function onProgress(value: number) {
  gsap
    .fromTo(
      uniforms.uProgress,
      { value: 1.0 - value },
      { value: value * 1.0, ease: 'circ', duration: 2, onUpdate: () => p_progress.refresh() },
    )
    .play();
}

function updatePosition(y: number, t: number) {
  sphere.position.y = MathUtils.lerp(sphere.position.y, y, t);
}

const pane = new Pane({ title: 'Debug Pane' });
const p_progress = pane.addBinding(uniforms.uProgress, 'value', {
  min: 0,
  max: 1,
  step: 0.01,
});

pane.addButton({ title: 'Progress 0' }).on('click', () => {
  onProgress(0);
  params.y = 0;
});
pane.addButton({ title: 'Progress 1' }).on('click', () => {
  onProgress(1);
  params.y = 10;
});

// EVENTS
function render() {
  // UPDATE
  timer.update();
  controls.update();

  const dt = timer.getDelta();
  const t = dt;

  uniforms.uTime.value += dt;

  updatePosition(params.y, t);
  // RENDER
  composer.render();
  // ANIMATION
  requestAnimationFrame(render);
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
