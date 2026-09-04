import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
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
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0.1, 0.3, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// WORLD
const floorGeometry = new PlaneGeometry(1, 1, 32, 32);
const floorMaterial = new MeshBasicMaterial({ color: 0x000000 });
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;

scene.add(floor);

const maxCount = 5000;

const positionArr = new Float32Array([
  // v1
  1.0, 0.0, 0.0,
  // v2
  0.0, 1.0, 0.0,
  // v3
  -1.0, 0.0, 0.0,
]);
const uvArr = new Float32Array([
  // v1
  1.0, 0.0,
  // v2
  0.5, 1.0,
  // v3
  0.0, 0.0,
]);

const uniforms = {
  uColor: new Uniform(new Color('#7CFC00')),
  uTime: new Uniform(0),
};

const grassbladeGeometry = new BufferGeometry();
grassbladeGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(positionArr, 3),
);
grassbladeGeometry.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));

grassbladeGeometry.scale(0.1, 0.1, 0.1);

const grassbladeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});

const grass = new InstancedMesh(
  grassbladeGeometry,
  grassbladeMaterial,
  maxCount,
);

const obj = new Object3D();
for (let i = 0; i < maxCount; i++) {
  const r = MathUtils.randFloat(0.1, 0.5);
  obj.scale.set(r, MathUtils.randFloat(0.5, 1), r);

  obj.position.set(
    MathUtils.randFloat(-0.5, 0.5),
    0,
    MathUtils.randFloat(-0.5, 0.5),
  );

  obj.updateMatrix();
  obj.updateMatrixWorld(true);

  grass.material.needsUpdate = true;
  grass.setMatrixAt(i, obj.matrix);
}

scene.add(grass);

const pane = new Pane({ title: 'Debug Params' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 2,
});

function render() {
  fpsGraph.begin();

  // UPDATE
  timer.update();
  const dt = timer.getDelta();

  controls.update();

  uniforms.uTime.value += dt;

  // RENDER
  renderer.render(scene, camera);
  // ANIMATION
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
