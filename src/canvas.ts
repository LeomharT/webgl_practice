import { Colors } from '@blueprintjs/colors';
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Timer,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const colors = [
  Colors.BLUE1,
  Colors.RED1,
  Colors.FOREST1,
  Colors.CERULEAN3,
  Colors.GOLD4,
  Colors.VIOLET1,
  Colors.INDIGO4,
];

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 1, 1100);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

const ballSphere = new SphereGeometry(1, 64, 64);
const ballMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
});
const ball = new Mesh(ballSphere, ballMaterial);
scene.add(ball);

/**
 * World
 */

function render() {
  // Update
  timer.update();
  controls.update();

  const dt = timer.getDelta();

  scene.environment = pmrem.fromScene(scene).texture;

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
