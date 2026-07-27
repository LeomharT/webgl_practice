import { Colors } from '@blueprintjs/colors';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#000000');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0.2, 0.3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const reflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
reflector.rotation.x = -Math.PI / 2;
(reflector.material as ShaderMaterial).polygonOffset = true;
(reflector.material as ShaderMaterial).polygonOffsetFactor = 0.01;
scene.add(reflector);

const uniforms = {
  uReflectorTexture: new Uniform(reflector.getRenderTarget().texture),
  uTextureMatrix: (reflector.material as ShaderMaterial).uniforms.textureMatrix,
};

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const sphereGeometry = new SphereGeometry(0.05, 32, 32);
const sphereMaterial = new MeshBasicMaterial({
  color: new Color(Colors.CERULEAN3),
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0.1, 0);
scene.add(sphere);

function render() {
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
