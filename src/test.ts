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
  MirroredRepeatWrapping,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
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

const textureLoader = new TextureLoader();

const floorTexture = textureLoader.load('floor-color.jpg');
floorTexture.colorSpace = SRGBColorSpace;

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

// BASE
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
camera.position.set(0, 3, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// WORLD
const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
const floorMaterial = new MeshBasicMaterial({
  map: floorTexture,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const grassGeo = new BufferGeometry();
const posArr = new Float32Array([
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
grassGeo.setAttribute('position', new Float32BufferAttribute(posArr, 3));
grassGeo.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));

const MAX_COUNT = 3000;

const uniforms = {
  uColor: new Uniform(new Color('#7CFC00')),
  uNoiseTexture: new Uniform(noiseTexture),
  uTime: new Uniform(0),
};

const grassMat = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});
const grass = new InstancedMesh(grassGeo, grassMat, MAX_COUNT);
const obj = new Object3D();

for (let i = 0; i < MAX_COUNT; i++) {
  const s = MathUtils.randFloat(0.1, 0.5);

  obj.position.set(MathUtils.randFloat(-5, 5), 0, MathUtils.randFloat(-5, 5));
  obj.scale.set(s, 1, s);
  obj.updateMatrix();
  obj.updateMatrixWorld();

  grass.setMatrixAt(i, obj.matrix);
}

scene.add(grass);

// EVENTS
function render() {
  // Update
  timer.update();
  controls.update();
  uniforms.uTime.value += timer.getDelta();
  // Render
  renderer.render(scene, camera);
  // Animation
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
