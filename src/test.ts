import { Colors } from '@blueprintjs/colors';
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
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, size.width / size.height, 0.01, 1000);
camera.position.set(0, 1, 1);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const floorGeometry = new PlaneGeometry(2.15, 2.15, 32, 32);
const floorMaterial = new MeshBasicMaterial({
  color: 0x000000,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const timer = new Timer();

const positionsArr = new Float32Array([
  //
  1.0, 0.0, 0.0,
  //
  0.0, 1.0, 0.0,
  //
  -1.0, 0.0, 0.0,
]);

const uvArr = new Float32Array([
  //
  1.0, 0.0,
  //
  0.5, 1.0,
  //
  0.0, 0.0,
]);

const grassbladeGeometry = new BufferGeometry();
grassbladeGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(positionsArr, 3),
);
grassbladeGeometry.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));

const uniforms = {
  uColor: new Uniform(new Color('#7CFC00')),
  uTime: new Uniform(0),
};

const instance = {
  count: 5000,
};

const grassbladeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});
const grass = new InstancedMesh(
  grassbladeGeometry,
  grassbladeMaterial,
  instance.count,
);

const obj = new Object3D();

console.log(ShaderChunk['begin_vertex'], ShaderChunk['project_vertex']);

for (let i = 0; i < instance.count; i++) {
  const x = MathUtils.randFloat(-1, 1);
  const z = MathUtils.randFloat(-1, 1);

  obj.position.set(x, obj.position.y, z);
  obj.scale.set(
    MathUtils.randFloat(0.05, 0.1),
    MathUtils.randFloat(0.07, 0.1),
    0.1,
  );
  obj.updateMatrix();
  obj.updateMatrixWorld();
  obj.updateWorldMatrix(true, true);

  grass.setMatrixAt(i, obj.matrix);
}

scene.add(grass);

function render() {
  // UPDATE
  timer.update();
  controls.update();

  const dt = timer.getDelta();
  uniforms.uTime.value += dt;

  // RENDER
  renderer.render(scene, camera);
  // ANIMATION
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});
