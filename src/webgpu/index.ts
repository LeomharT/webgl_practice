import { Colors } from '@blueprintjs/colors';
import {
  ACESFilmicToneMapping,
  Color,
  Mesh,
  MeshStandardMaterial,
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
import { texture } from 'three/tsl';
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu';
import { Pane } from 'tweakpane';
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
renderer.toneMapping = ACESFilmicToneMapping;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(0.2, 0.2, 0.2);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textLoader = new TextureLoader();

const floorColorMap = textLoader.load('/floor-color.jpg');
floorColorMap.colorSpace = SRGBColorSpace;

// WORLD
const floorGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorMaterial = new MeshBasicNodeMaterial({});
floorMaterial.colorNode = texture(floorColorMap);

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const torusGeometry = new TorusKnotGeometry(0.05, 0.02, 64, 64);
const torusMaterial = new MeshStandardMaterial();
const torus = new Mesh(torusGeometry, torusMaterial);
torus.position.y = 0.1;
scene.add(torus);

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
