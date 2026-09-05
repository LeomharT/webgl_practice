import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Spherical,
  Timer,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Pane } from 'tweakpane';
import simplex4DNoise from '../shader/include/simplex4DNoise.glsl?raw';
import fragmentShader from '../shader/test/fragment.glsl?raw';
import vertexShader from '../shader/test/vertex.glsl?raw';
import '../style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

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
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const timer = new Timer();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const uniforms = {
  uSunPosition: new Uniform(new Vector3()),
  uTime: new Uniform(0),
};

const spherical = new Spherical(1, Math.PI / 2, 0.5);
const position = new Vector3();

const sun = new Mesh(
  new IcosahedronGeometry(0.1, 3),
  new MeshBasicMaterial({ color: new Color(Colors.GOLD5) }),
);
function updateSun() {
  position.setFromSpherical(spherical);
  uniforms.uSunPosition.value.copy(position.clone());
  sun.position.copy(position.clone().multiplyScalar(1.5));
}
updateSun();

scene.add(sun);

const geometry = mergeVertices(new IcosahedronGeometry(1, 50));
geometry.computeTangents();

const material = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const ball = new Mesh(geometry, material);
scene.add(ball);

const pane = new Pane({ title: 'Debug pane' });
pane
  .addBinding(spherical, 'phi', {
    step: 0.01,
    min: 0,
    max: Math.PI,
  })
  .on('change', updateSun);
pane
  .addBinding(spherical, 'theta', {
    step: 0.01,
    min: -Math.PI,
    max: Math.PI,
  })
  .on('change', updateSun);

function render() {
  // UPDATE
  timer.update();
  controls.update();
  uniforms.uTime.value += timer.getDelta();
  // RENDER
  renderer.render(scene, camera);
  // ANIMATION
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
