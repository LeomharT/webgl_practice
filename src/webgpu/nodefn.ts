import { Colors } from '@blueprintjs/colors';
import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  LineBasicMaterial,
  Mesh,
  MirroredRepeatWrapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  TorusKnotGeometry,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { distance, float, Fn, uv, vec2, vec3 } from 'three/tsl';
import { MeshStandardNodeMaterial, Node, WebGPURenderer } from 'three/webgpu';
import simplex4DNoise from '../shader/include/simplex4DNoise.glsl?raw';
import '../style.css';

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
const inspector = new Inspector();
renderer.inspector = inspector;

el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(5, 4.5, 2.5);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textLoader = new TextureLoader();

const uvCheckerTexture = textLoader.load('/uv_checker.png');
uvCheckerTexture.colorSpace = SRGBColorSpace;
uvCheckerTexture.wrapT = uvCheckerTexture.wrapS = MirroredRepeatWrapping;

// WORLD
const fade = Fn(function () {
  const dist = distance(uv(), vec2(0.5));
  const radius = dist.smoothstep(0.2, 0.5).oneMinus();

  return radius;
});

const circel = Fn(function ({
  coord = uv(),
  center = vec2(0.5),
  radius = float(0.25),
  thickness = float(0.05),
}: {
  coord?: Node<'vec2'>;
  center?: Node<'vec2'>;
  radius?: Node<'float'>;
  thickness?: Node<'float'>;
}) {
  const dist = distance(coord, center);
  const lineSDF = dist.sub(radius);
  const line = lineSDF.abs().step(thickness.div(2)).oneMinus();

  return line;
});

const floorGeometry = new PlaneGeometry(10, 10, 16, 16);
const floorMaterial = new MeshStandardNodeMaterial({
  transparent: true,
});
floorMaterial.colorNode = vec3(circel({}));

floorMaterial.opacityNode = fade();

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// KORUS KNOT
const torusGeometry = new TorusKnotGeometry(0.5, 0.24, 128, 32);
const torusMaterial = new MeshStandardNodeMaterial({
  color: new Color(Colors.WHITE),
});

const torus = new Mesh(torusGeometry, torusMaterial);
torus.castShadow = true;
torus.position.y = 1;
scene.add(torus);

const ambientLight = new AmbientLight(0x859dff, 1);
scene.add(ambientLight);

const lightTweak = inspector.createParameters('Ambient Light');
lightTweak.addColor(ambientLight, 'color');

const directionalLight = new DirectionalLight(0xffffff, 4.5);
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

renderer.setAnimationLoop(render);

function render() {
  // UPDATE
  timer.update();
  controls.update();
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
