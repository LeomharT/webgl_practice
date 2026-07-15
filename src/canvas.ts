import { Colors } from '@blueprintjs/colors';
import { Color, PerspectiveCamera, Points, Scene, ShaderChunk, SphereGeometry, WebGLRenderer } from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/draco/');
dracoloader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoloader);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

// Basic
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;

// World

const geometry1 = new SphereGeometry(3, 32, 32);
geometry1.setIndex(null);

const uniforms = {};

const pointMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const points = new Points(geometry1, pointMaterial);

scene.add(points);

function render() {
  // Update
  controls.update();
  // Render
  renderer.render(scene, camera);
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
