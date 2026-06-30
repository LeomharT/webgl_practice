import { Colors } from '@blueprintjs/colors';
import {
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const textureLoader = new TextureLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  piexelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.piexelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const normalTexture = textureLoader.load('/normal.png');
const roughnessTexture = textureLoader.load('/roughness.jpg');

const uniforms = {
  uNormal: new Uniform(normalTexture),
  uRoughness: new Uniform(roughnessTexture),
};

const planeGeometry = new PlaneGeometry(3, 3, 64, 64);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const planeMaterial2 = new MeshStandardMaterial({
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  roughness: 1.0,
});

const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const directionalLight = new DirectionalLight(0xffffff);
directionalLight.position.set(0.0, 1.25, 1.0);
scene.add(directionalLight);

function render() {
  timer.update();
  controls.update();

  //
  renderer.render(scene, camera);
  //
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
