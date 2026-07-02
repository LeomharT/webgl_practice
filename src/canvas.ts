import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Timer,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const textureLoader = new TextureLoader();

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

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0.5, 0.5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const normalMap = textureLoader.load('/normal.png');
const roughnessMap = textureLoader.load('/roughness.jpg');
const opacityMap = textureLoader.load('/opacity.jpg');

const planeGeometry = new PlaneGeometry(1, 1, 32, 32);

const planeReflector = new Reflector(planeGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
planeReflector.rotation.x = -Math.PI / 2;
planeReflector.position.y = -0.0001;
scene.add(planeReflector);

const uniforms = {
  // Matrix
  uReflectTexture: new Uniform(planeReflector.getRenderTarget().texture),

  // Texture
  uTextureMatrix: (planeReflector.material as ShaderMaterial).uniforms.textureMatrix,
  uNormalMap: new Uniform(normalMap),
  uRoughnessMap: new Uniform(roughnessMap),
  uOpacityMap: new Uniform(opacityMap),

  // Float
  uTime: new Uniform(0),
  uDistortionAmount: new Uniform(0.058),
  uBlurStrength: new Uniform(4.42),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uRippleScale: new Uniform(10.0),
};
uniforms.uReflectTexture.value.generateMipmaps = true;
uniforms.uReflectTexture.value.minFilter = LinearMipmapLinearFilter;
uniforms.uReflectTexture.value.magFilter = LinearFilter;

const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ballGeometry = new IcosahedronGeometry(0.07, 5);
const ballMaterial = new MeshBasicMaterial({
  color: new Color(Colors.VIOLET4),
});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.14;
scene.add(ball);

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

const f_plane = pane.addFolder({ title: '⬜ Plane' });
f_plane.addBinding(uniforms.uDistortionAmount, 'value', {
  label: 'Distortion Amount',
  step: 0.001,
  min: 0,
  max: 1,
});
f_plane.addBinding(uniforms.uBlurStrength, 'value', {
  label: 'Blur Strength',
  step: 0.001,
  min: 0,
  max: 20,
});
f_plane.addBinding(uniforms.uRippleScale, 'value', {
  label: 'Ripple Scale',
  step: 0.001,
  min: 0,
  max: 20,
});

const f_ball = pane.addFolder({ title: '⚪ Ball' });
f_ball.addBinding(ball.position, 'y', {
  step: 0.01,
  min: 0,
  max: 1,
});
f_ball.addBinding(ballMaterial, 'color', {
  color: { type: 'float' },
});

function render() {
  //
  timer.update();

  const dt = timer.getDelta();
  uniforms.uTime.value += dt;

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
  uniforms.uResolution.value.set(sizes.width, sizes.height);

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
