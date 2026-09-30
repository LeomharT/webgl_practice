import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  color,
  float,
  mix,
  mx_noise_float,
  mx_worley_noise_float,
  parallaxUV,
  time,
  uv,
  vec3,
} from 'three/tsl';
import {
  Color,
  Mesh,
  MeshBasicNodeMaterial,
  Node,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
CameraControls.install({ THREE: await import('three') });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root');

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(0, 0, 2);
camera.lookAt(scene.position);

const inspector = new Inspector();
renderer.inspector = inspector;

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.2;

const timer = new Timer();

// Scene
const geometry = new PlaneGeometry(2, 2, 1, 1);
const material = new MeshBasicNodeMaterial();

const depthUv = parallaxUV(uv(), float(0.5)) as Node<'vec2'>;
const depthInput = vec3(depthUv.xy.mul(6), time.mul(0.3));
const causticsNoise = mx_worley_noise_float(depthInput).pow(6);
const depthColor = mix(color(0x1b3956), color(0x11eeff), causticsNoise);

const foamInput = vec3(uv().mul(5), time.mul(0.1));
const foamNoise = mx_noise_float(foamInput);
const foamMask = foamNoise.abs().step(0.05).oneMinus();
const foamColor = color(0xe5f7ff);

const lilyPadInput = vec3(uv().mul(4), 0);
const lilyPadNoise = mx_worley_noise_float(lilyPadInput).pow2();
const lilyPadMask = lilyPadNoise.step(0.2).oneMinus();
const lilyPadColor = mix(
  color(0xd7e689),
  color(0x329a89),
  lilyPadNoise.div(0.2),
);

const final = mix(depthColor, foamColor, foamMask);
material.colorNode = mix(final, lilyPadColor, lilyPadMask);

const mesh = new Mesh(geometry, material);
scene.add(mesh);

function render() {
  // UPDATE
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // RENDER
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
