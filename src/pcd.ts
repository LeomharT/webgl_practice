import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { float, instancedBufferAttribute, vec3 } from 'three/tsl';
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  PointsNodeMaterial,
  Scene,
  Sprite,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
import './style.css';

CameraControls.install({ THREE: await import('three') });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.max(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
await renderer.init();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.1,
  10000,
);
camera.position.set(0, 3, 3);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.enabled = true;

const timer = new Timer();

const boxGeometry = new BoxGeometry(3, 3, 3, 32, 32, 32);
const geometry = new BufferGeometry();
geometry.setAttribute('position', boxGeometry.attributes.position);

const material = new PointsNodeMaterial({
  positionNode: instancedBufferAttribute(
    new BufferAttribute(boxGeometry.attributes.position.array, 3),
  ),
});
material.colorNode = vec3(0.0, 1.0, 0.0);
material.sizeNode = float(2);

const points = new Sprite(material);

scene.add(points);

// Time

function render() {
  // UPDATE
  timer.update();
  controls.update(timer.getDelta());
  // RENDER
  renderer.render(scene, camera);
  // ANIMTATION
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
