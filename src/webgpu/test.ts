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
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Timer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import {
  atan,
  cameraPosition,
  cos,
  mat2,
  PI,
  positionLocal,
  sin,
  vec3,
} from 'three/tsl';
import { MeshBasicNodeMaterial, Node, WebGPURenderer } from 'three/webgpu';
import { Pane } from 'tweakpane';
import '../style.css';

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
camera.position.set(0.2, 0.5, 0.5);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textLoader = new TextureLoader();

const floorColorMap = textLoader.load('/floor-color.jpg');
floorColorMap.colorSpace = SRGBColorSpace;

const floorGeo = new PlaneGeometry(1, 1, 32, 32);
const floorMat = new MeshBasicMaterial({
  map: floorColorMap,
});
const floor = new Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// WORLD
const geometry = new BufferGeometry();
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
geometry.setAttribute('position', new Float32BufferAttribute(posArr, 3));
geometry.setAttribute('uv', new Float32BufferAttribute(uvArr, 2));
geometry.scale(0.1, 0.1, 0.1);

const material = new MeshBasicNodeMaterial({
  side: DoubleSide,
});

function rotate2D(v: Node<'vec2'>, theta: Node<'float'>) {
  const c = cos(theta);
  const s = sin(theta);

  return mat2(c, s.negate(), s, c).transpose().mul(v);
}

const rotateCenter = positionLocal.mul(vec3(0.0), 1.0);
const viewDirection = cameraPosition.xz.sub(rotateCenter);
const theta = atan(viewDirection).add(PI.div(2));

const rotated = rotate2D(positionLocal.xz, theta.x);

material.positionNode = vec3(rotated.x, positionLocal.y, rotated.y);

const MAX_COUNT = 2000;

const grass = new InstancedMesh(geometry, material, MAX_COUNT);
const obj = new Object3D();

function updateGrassPos() {
  for (let i = 0; i < MAX_COUNT; i++) {
    const r = MathUtils.randFloat(0.2, 0.5);

    obj.scale.set(r, 1, r);

    obj.position.set(
      MathUtils.randFloat(-0.5, 0.5),
      0,
      MathUtils.randFloat(-0.5, 0.5),
    );
    obj.updateMatrix();
    obj.updateMatrixWorld();

    grass.setMatrixAt(i, obj.matrix);
  }
}
updateGrassPos();

scene.add(grass);

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
