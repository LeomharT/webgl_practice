import { Colors } from '@blueprintjs/colors';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import {
  cameraPosition,
  dot,
  normalWorld,
  positionWorld,
  vec3,
} from 'three/tsl';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
import { Pane } from 'tweakpane';

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
camera.position.set(3, 2.5, 1.5);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textLoader = new TextureLoader();

const earthGeometry = new SphereGeometry(1, 64, 64);
const earthMaterial = new MeshBasicMaterial();

const viewDirection = positionWorld.sub(cameraPosition).normalize();
const fresnel = dot(normalWorld, viewDirection);

earthMaterial.colorNode = vec3(fresnel.add(1).pow4());

const earth = new Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const pane = new Pane({ title: 'Debug pane' });

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
