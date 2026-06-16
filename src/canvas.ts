import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Timer,
  Vector2,
  WebGLRenderer,
} from 'three';
import { EffectComposer, OrbitControls, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import './style.css';

const colors = [
  Colors.BLUE1,
  Colors.RED1,
  Colors.FOREST1,
  Colors.CERULEAN3,
  Colors.GOLD4,
  Colors.VIOLET1,
  Colors.INDIGO4,
];

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 1, 1100);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

const composer = new EffectComposer(renderer);

const bloomPass = new UnrealBloomPass(new Vector2(sizes.width, sizes.height), 0.5, 0.5, 0);

composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

/**
 * World
 */

const positions = Array.from({ length: 50 }, () => ({
  x: MathUtils.randFloatSpread(10),
  y: MathUtils.randFloatSpread(10),
  z: MathUtils.randFloatSpread(10),
}));

const ballGeometry = new IcosahedronGeometry(0.5, 3);
const ballMaterial = new MeshStandardMaterial({
  metalness: 0.8,
  roughness: 0.1,
  color: 'white',
});
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const planeGeometry = new PlaneGeometry(1.61803398875, 0.5);
const planeMaterial = new MeshBasicMaterial({});
const plane = new InstancedMesh(planeGeometry, planeMaterial, 50);

const obj = new Object3D();

function updatePlane() {
  for (let i = 0; i < 50; i++) {
    obj.position.copy(positions[i]);

    obj.lookAt(scene.position);
    obj.updateMatrix();

    plane.instanceMatrix.needsUpdate = true;
    plane.setMatrixAt(i, obj.matrix);
    plane.setColorAt(i, new Color(colors[i % colors.length]));
  }
}
updatePlane();

scene.add(plane);

function render() {
  // Update
  timer.update();
  controls.update();

  const dt = timer.getDelta();
  plane.rotation.y += dt / 5;

  scene.environment = pmrem.fromScene(scene).texture;

  // Render
  composer.render();
  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
