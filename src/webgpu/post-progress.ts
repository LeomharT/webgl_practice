import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { SkyMesh } from 'three/examples/jsm/objects/SkyMesh.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { chromaticAberration } from 'three/examples/jsm/tsl/display/ChromaticAberrationNode.js';
import { pixelationPass } from 'three/examples/jsm/tsl/display/PixelationPassNode.js';
import { distance, float, pass, texture, uv, vec2 } from 'three/tsl';
import {
  ACESFilmicToneMapping,
  AgXToneMapping,
  AmbientLight,
  AxesHelper,
  CameraHelper,
  CineonToneMapping,
  Color,
  CustomToneMapping,
  DirectionalLight,
  LinearToneMapping,
  MathUtils,
  Mesh,
  MeshStandardNodeMaterial,
  NeutralToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  ReinhardToneMapping,
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
renderer.toneMapping = CineonToneMapping;
// Post progress

el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(5, 4, 3);
camera.lookAt(scene.position);

const inspector = new Inspector();
renderer.inspector = inspector;

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;
controls.dollySpeed = 0.8;
controls.maxDistance = 20;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.2;

const timer = new Timer();

const floorTexture = textureLoader.load('floor-color.jpg');

// Post progress
const pipeline = new RenderPipeline(renderer);

// Render scene
// const scenePass = new RenderPass(scene,camera)
const scenePass = pass(scene, camera);
pipeline.outputNode = scenePass;

const _pixelationPass = pixelationPass(scene, camera, 6, 0.3, 0.4);
pipeline.outputNode = _pixelationPass;

/**
 * Bloom effect
 */
const bloomPass = bloom(scenePass);
bloomPass.threshold.value = 0.35;
bloomPass.strength.value = 1.0;
bloomPass.radius.value = 0.5;
pipeline.outputNode = _pixelationPass.add(bloomPass);

const bloomPane = inspector.createParameters('Bloom');
bloomPane.add(bloomPass.threshold, 'value', 0, 2, 0.01).name('Threshold');
bloomPane.add(bloomPass.strength, 'value', 0, 10, 0.01).name('Strength');
bloomPane.add(bloomPass.radius, 'value', 0, 2, 0.01).name('Radius');

const chromaticAberrationPass = chromaticAberration(
  pipeline.outputNode,
  float(2),
  vec2(0.5),
  float(1),
);
pipeline.outputNode = chromaticAberrationPass;

// Scene
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
const floorMaterial = new MeshStandardNodeMaterial({
  transparent: true,
});

const opacity = distance(uv(), vec2(0.5)).smoothstep(0.2, 0.5).oneMinus();
floorMaterial.opacityNode = opacity;
floorMaterial.colorNode = texture(floorTexture, uv());

const floor = new Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

gltfLoader.load('/anvil.glb', (data) => {
  const model = data.scene;
  model.traverse((obj) => {
    if (obj instanceof Mesh) obj.castShadow = true;
  });

  scene.add(model);
});

const axesHelper = new AxesHelper(10);
scene.add(axesHelper);

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

const renderer_pane = inspector.createParameters('Renderer Settings');
renderer_pane
  .add(renderer, 'toneMapping', {
    NoToneMapping: NoToneMapping,
    LinearToneMapping: LinearToneMapping,
    ReinhardToneMapping: ReinhardToneMapping,
    CineonToneMapping: CineonToneMapping,
    ACESFilmicToneMapping: ACESFilmicToneMapping,
    CustomToneMapping: CustomToneMapping,
    AgXToneMapping: AgXToneMapping,
    NeutralToneMapping: NeutralToneMapping,
  })
  .name('Tone Mapping');
renderer_pane
  .add(renderer, 'toneMappingExposure', 0, 10, 0.01)
  .name('Exposure');

const light_pane = inspector.createParameters('Directional Light');
light_pane.add(directionalLight.shadow, 'radius', 0, 10, 0.01);
light_pane.add(directionalLight.shadow, 'normalBias', 0, 1, 0.01);
light_pane.add(cameraHelper, 'visible').name('Camera Helper Visiblity');

function render() {
  // UPDATE
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // RENDER
  pipeline.render();
}
renderer.setAnimationLoop(render);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
