import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  Fn,
  min,
  mul,
  mx_noise_float,
  mx_noise_vec3,
  positionLocal,
  rotate,
  time,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
CameraControls.install({ THREE: await import('three') });

const gltfLoader = new GLTFLoader();

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
camera.position.set(2, 4, 8);
camera.lookAt(scene.position);

const inspector = new Inspector();
renderer.inspector = inspector;

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.2;

const timer = new Timer();

gltfLoader.load('bakedModel.glb', (data) => {
  const model = data.scene;
  scene.add(model);

  const geometry = new PlaneGeometry(1, 1, 16, 64);
  geometry.translate(0, 0.5, 0);
  geometry.scale(1.5, 6, 1.5);

  const material = new MeshBasicNodeMaterial({
    depthWrite: false,
    side: DoubleSide,
    transparent: true,
    wireframe: false,
    color: 0x7e583a
  });

  // Position
  material.positionNode = Fn(() => {
    const position = positionLocal;

    const angle = position.y.mul(0.3).add(time.negate().mul(0.2)).sin().mul(3);

    const windCoordinates = position.sub(vec3(0, time.mul(0.3), 0)).mul(0.4);
    const windStrength = uv().y.mul(5);
    const wind = mx_noise_vec3(windCoordinates).mul(windStrength);

    position.addAssign(wind);
    position.xz.assign(rotate(position.xz, angle));
    return position;
  })();

  const smoke = mx_noise_float(
    uv()
      .mul(vec2(3, 2))
      .sub(vec2(0, time.mul(0.1))),
  );
  const edgeFade = min(
    uv().y.mul(10),
    uv().y.oneMinus(),
    uv().x.mul(5),
    uv().x.oneMinus().mul(5)
  );

  material.opacityNode = mul(smoke, edgeFade).clamp(0, 1);

  const mesh = new Mesh(geometry, material);
  mesh.position.y = 1.83;
  scene.add(mesh);
});

// Scene

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
