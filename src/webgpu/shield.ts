import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { SkyMesh } from 'three/examples/jsm/objects/SkyMesh.js';
import { distance, pass, texture, uv, vec2 } from 'three/tsl';
import {
  AmbientLight,
  AxesHelper,
  CameraHelper,
  Color,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshBasicNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RenderPipeline,
  Scene,
  TextureLoader,
  Timer,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu';

CameraControls.install({ THREE: await import('three') });

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

const floorTexture = textureLoader.load('floor-color.jpg');

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
renderer.setAnimationLoop(render);

const inspector = new Inspector({});
renderer.inspector = inspector;

document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 1.25;

const timer = new Timer();

// Renderer pipeline
const renderPipeline = new RenderPipeline(renderer);

const scenePass = pass(scene, camera);
renderPipeline.outputNode = scenePass;

// World
const sky = new SkyMesh();
sky.scale.setScalar(1000);
scene.add(sky);
const effectController = {
  turbidity: 5.5,
  rayleigh: 1.25,
  mieCoefficient: 0.02,
  mieDirectionalG: 0.35,
  elevation: 0.4,
  azimuth: 100,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5,
};
const sun = new Vector3();

const skyChanged = () => {
  sky.turbidity.value = effectController.turbidity;
  sky.rayleigh.value = effectController.rayleigh;
  sky.mieCoefficient.value = effectController.mieCoefficient;
  sky.mieDirectionalG.value = effectController.mieDirectionalG;
  sky.cloudCoverage.value = effectController.cloudCoverage;
  sky.cloudDensity.value = effectController.cloudDensity;
  sky.cloudElevation.value = effectController.cloudElevation;

  const phi = MathUtils.degToRad(90 - effectController.elevation);
  const theta = MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  sky.sunPosition.value.copy(sun);
};

skyChanged();

const floorGeometry = new PlaneGeometry(10, 10, 1, 1);
const floorMaterial = new MeshBasicNodeMaterial({
  transparent: true,
});
floorMaterial.colorNode = texture(floorTexture, uv());
floorMaterial.opacityNode = distance(uv(), vec2(0.5))
  .smoothstep(0.2, 0.5)
  .oneMinus();

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;

scene.add(floor);

gltfLoader.load('/anvil.glb', (data) => {
  const model = data.scene;
  model.traverse((obj) => {
    if (obj instanceof Mesh) obj.castShadow = true;
  });

  scene.add(model);
});

const ambientLight = new AmbientLight(0x859dff, 0.75);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 4.5);
directionalLight.position.set(2, 0.75, -1).normalize().multiplyScalar(10);
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 20;
directionalLight.castShadow = true;
directionalLight.shadow.radius = 5;
directionalLight.shadow.normalBias = 0.1;
scene.add(directionalLight);
const cameraHelper = new CameraHelper(directionalLight.shadow.camera);
cameraHelper.visible = false;
scene.add(cameraHelper);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

function render() {
  // Update
  timer.update();

  const dt = timer.getDelta();
  controls.update(dt);

  // Render
  renderPipeline.render();
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
