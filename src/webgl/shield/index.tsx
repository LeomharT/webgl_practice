import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { GLTFLoader, TransformControls } from 'three/examples/jsm/Addons.js';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import sphereFragmentShader from './shader/sphere/fragment.glsl?raw';
import sphereVertexShader from './shader/sphere/vertex.glsl?raw';

CameraControls.install({ THREE: await import('three') });

const gltfLoader = new GLTFLoader();
const textLoader = new TextureLoader();

const floorTexture = textLoader.load('floor-color.jpg');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;
controls.dollySpeed = 0.24;
controls.maxDistance = 20;

const timer = new Timer();

// World

const sphereGeometry = new SphereGeometry(1, 32, 32);
const sphereMaterial = new ShaderMaterial({
  vertexShader: sphereVertexShader,
  fragmentShader: sphereFragmentShader,
  transparent: true,
  blending: AdditiveBlending,
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.visible = true;
sphere.matrixAutoUpdate = true;
sphere.updateMatrixWorld();
sphere.updateMatrix();
scene.add(sphere);

const uniforms = {
  uSpherePosition: new Uniform(sphere.matrixWorld),
};

const planeGeometry = new PlaneGeometry(5, 5, 1, 1);
const planeMaterial = new CustomShaderMaterial({
  baseMaterial: MeshPhysicalMaterial,
  uniforms,
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  map: floorTexture,
  blending: AdditiveBlending,
  transparent: true,
});
planeMaterial.defines = {
  IS_FLOOR: true,
};
const floor = new Mesh(planeGeometry, planeMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
floor.renderOrder = -1;
scene.add(floor);

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.attach(sphere);
transformControls.setSize(0.5);
transformControls.addEventListener('dragging-changed', ({ value }) => {
  controls.enabled = !value;
});

scene.add(transformControls.getHelper());

gltfLoader.load('/anvil.glb', (data) => {
  const model = data.scene;
  model.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;

      const m = obj.material;

      obj.material = new CustomShaderMaterial({
        baseMaterial: MeshStandardMaterial,
        map: m.map,
        uniforms,
        vertexShader: floorVertexShader,
        fragmentShader: floorFragmentShader,
      });
    }
  });

  scene.add(model);
});

const ambientLisht = new AmbientLight(0xffffff, 0.25);
scene.add(ambientLisht);

const directionLight = new DirectionalLight(0xfaa312, 1.25);
directionLight.position.set(3, 3, 3);
directionLight.castShadow = true;
scene.add(directionLight);

function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});
