import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import {
  AmbientLight,
  AxesHelper,
  CircleGeometry,
  Color,
  DirectionalLight,
  LineBasicMaterial,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  SRGBColorSpace,
  TextureLoader,
  Timer,
} from 'three';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import type { ParametersGroup } from 'three/examples/jsm/inspector/tabs/Parameters.js';
import {
  atan,
  color,
  cos,
  distance,
  float,
  Fn,
  mix,
  mul,
  mx_noise_float,
  mx_worley_noise_float,
  parallaxUV,
  PI,
  PI2,
  rand,
  time,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  WebGPURenderer,
} from 'three/webgpu';
import simplex4DNoise from '../shader/include/simplex4DNoise.glsl?raw';
import '../style.css';

CameraControls.install({ THREE: await import('three') });

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const el = document.querySelector('#root') as HTMLDivElement;
el.style.background = Colors.BLACK;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x111111);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(0, 1, 2);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.2;
controls.setTarget(0, 1, 0);

const inspector = new Inspector();
renderer.inspector = inspector;

const textLoader = new TextureLoader();

const floorColorMap = textLoader.load('/floor-color.jpg');
floorColorMap.colorSpace = SRGBColorSpace;

// WORLD
const floorGeometry = new PlaneGeometry(10, 10, 10, 10);
const floorMaterial = new MeshStandardNodeMaterial({
  transparent: true,
  map: floorColorMap,
});
const fade = distance(uv(), vec2(0.5)).smoothstep(0.2, 0.5).oneMinus();
floorMaterial.opacityNode = fade;

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const geometry = new CircleGeometry(2, 32);
const planeMaterial = new MeshBasicNodeMaterial({});

//
planeMaterial.colorNode = vec3(uv(), 1.0);
//
planeMaterial.colorNode = vec3(uv().x.mul(10).mod(2));
//
planeMaterial.colorNode = vec3(distance(uv(), vec2(0.5)));

const polarUv = uv().sub(0.5);
const angle = atan(polarUv.x, polarUv.y).add(PI).div(PI2);
planeMaterial.colorNode = vec3(angle);

//
const subdivision = 10;
const gridUv = uv().mul(subdivision).floor().add(time.floor());
// const random = hash(gridUv.x.mul(subdivision).add(gridUv.y));
const random = rand(gridUv);
const mixC = mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), random);
planeMaterial.colorNode = vec3(mixC);

//
const perlinUv = uv().mul(5);
const perlinNoise = mx_noise_float(perlinUv);
planeMaterial.colorNode = vec3(perlinNoise.mul(5).add(time).fract().step(0.8));

// https://iquilezles.org/articles/palettes/
// cosine based palette, 4 vec3 params
const palette = /*@__PURE__*/ Fn(
  ([t, a, b, c, d]: any) => {
    return a.add(b.mul(cos(mul(6.283185, c.mul(t).add(d)))));
  },
  { t: 'float', a: 'vec3', b: 'vec3', c: 'vec3', d: 'vec3', return: 'vec3' },
);

const worleyUv = uv().mul(10);
const worleyNoise = mx_worley_noise_float(vec3(worleyUv, time));
planeMaterial.colorNode = vec3(worleyNoise);
// planeMaterial.colorNode = palette(
//   worleyNoise,
//   vec3(0.5, 0.3, 0.4),
//   vec3(0.9, 0.5, 0.4),
//   vec3(1.0, 1.0, 1.0),
//   vec3(0.0, 0.1, 0.2),
// );

//
const depthUv = (parallaxUV(uv(), float(0.5)) as Node<'vec3'>).xy;
const causticsInput = vec3(depthUv.mul(6), time.mul(0.3));
const causticsNoise = mx_worley_noise_float(causticsInput).pow4();
const depthColor = mix(color(0x1b3956), color(0x11eeff), causticsNoise);

const formInput = uv().mul(5);
const formNoise = mx_noise_float(vec3(formInput, time.mul(0.1)));
const formMast = formNoise.abs().step(0.05).oneMinus();
const formColor = color(0xe5f7ff);

const lilyPadInput = vec3(uv().mul(4), 0.0);
const lilyPadNoise = mx_worley_noise_float(lilyPadInput).pow2();
const lilyPadMask = lilyPadNoise.step(0.2).oneMinus();
const lilyPadColor = mix(
  color(0xd7e689),
  color(0x329a89),
  lilyPadNoise.div(0.2),
);
const final = mix(depthColor, formColor, formMast);

planeMaterial.colorNode = mix(
  final,
  vec3(lilyPadColor).mul(lilyPadMask),
  lilyPadMask,
);

const plane = new Mesh(geometry, planeMaterial);
plane.position.y = 1;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// KORUS KNOT

const ambientLight = new AmbientLight(0x859dff, 1);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 10.5);
directionalLight.position.set(2, 0.75, -1).normalize().multiplyScalar(10);
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 20;
directionalLight.castShadow = true;
directionalLight.shadow.radius = 3;
directionalLight.shadow.normalBias = 0.1;
scene.add(directionalLight);

const axesHelper = new AxesHelper();
axesHelper.frustumCulled = false;
(axesHelper.material as LineBasicMaterial).polygonOffset = true;
(axesHelper.material as LineBasicMaterial).polygonOffsetFactor = 0.3;

scene.add(axesHelper);

const camera_debug = inspector.createParameters('Camera') as ParametersGroup;
camera_debug
  .add(
    {
      reset: () => {
        controls.setTarget(0, 1, 0, true);
        controls.setPosition(0, 1, 2, true);
      },
    },
    'reset',
  )
  .name('Reset Camera');

renderer.setAnimationLoop(render);

function render() {
  // UPDATE
  timer.update();
  controls.update(timer.getDelta());
  // RENDER
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
