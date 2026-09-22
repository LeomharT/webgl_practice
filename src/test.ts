import { Colors } from '@blueprintjs/colors';
import {
  Color,
  Mesh,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import random2D from './shader/include/random2D.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['random2D'] = random2D;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, devicePixelRatio),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();

const floorTexture = textureLoader.load('floor-color.jpg');
floorTexture.colorSpace = SRGBColorSpace;

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

// BASE
const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, size.width / size.height, 0.01, 1000);
camera.position.set(0, 0, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const uniforms = {
  uTime: new Uniform(0),
  uColorA: new Uniform(new Color(Colors.GREEN5)),
  uColorB: new Uniform(new Color(Colors.BLACK)),
};

// WORLD
const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const pane = new Pane({ title: 'Pane' });
pane
  .addBinding(uniforms.uColorA, 'value', {
    color: { type: 'float' },
  })
  .on('change', (val) => {
    uniforms.uColorA.value
      .set(val.value.r, val.value.g, val.value.b)
      .convertSRGBToLinear();
  });
pane
  .addBinding(uniforms.uColorB, 'value', {
    color: { type: 'float' },
  })
  .on('change', (val) => {
    uniforms.uColorA.value
      .set(val.value.r, val.value.g, val.value.b)
      .convertSRGBToLinear();
  });

// EVENTS
function render() {
  // Update
  timer.update();
  controls.update();
  uniforms.uTime.value += timer.getDelta();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});
