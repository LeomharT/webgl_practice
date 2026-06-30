import { Colors } from '@blueprintjs/colors';
import {
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
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
camera.position.set(0, 1, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const normalTexture = textureLoader.load('/normal.png');
const roughnessTexture = textureLoader.load('/roughness.jpg');

const planeGeometry = new PlaneGeometry(1, 1, 64, 64);

const planeMirrow = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
  clipBias: 0.003,
});
planeMirrow.rotation.x = -Math.PI / 2;
planeMirrow.position.y = -0.0001;
scene.add(planeMirrow);

const uniforms = {
  uNormal: new Uniform(normalTexture),
  uRoughness: new Uniform(roughnessTexture),
  uReflectorTexture: new Uniform(planeMirrow.getRenderTarget().texture),
  uTextureMatrix: (planeMirrow.material as ShaderMaterial).uniforms.textureMatrix,
};

console.log(uniforms);

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ball = new Mesh(new IcosahedronGeometry(0.05, 3), new MeshBasicMaterial({ color: 'blue' }));
ball.position.y = 0.5;
scene.add(ball);

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
