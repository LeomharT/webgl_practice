import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
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
};

const el = document.querySelector('#root');

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
  uReflectorTexture: new Uniform(floorReflector.getRenderTarget().texture),
  uTextureMatrix: (floorReflector.material as ShaderMaterial).uniforms.textureMatrix,
};

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

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
