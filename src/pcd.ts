import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AxesHelper,
  Box3Helper,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls, PCDLoader } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/pcd/fragment.glsl?raw';
import vertexShader from './shader/pcd/vertex.glsl?raw';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

// LOADER
const pcdLoader = new PCDLoader();

// BASIC
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(3, 5, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// WORLD
const uniforms = {
  uSize: new Uniform(0.02),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uMinHeight: new Uniform(0),
  uMaxHeight: new Uniform(0),
};

pcdLoader.load('/test_16f.pcd', (data) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', data.geometry.attributes.position);
  geometry.rotateX(-Math.PI / 2);

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  if (geometry.boundingBox) {
    uniforms.uMaxHeight.value = geometry.boundingBox.max.y;
    uniforms.uMinHeight.value = -geometry.boundingBox.max.y;
  }
  if (geometry.boundingSphere) controls.target = geometry.boundingSphere.center;

  const points = new Points(geometry, material);

  //   points.rotation.x = -Math.PI / 2;
  scene.add(points);

  const boxHelper = new Box3Helper(
    geometry.boundingBox!,
    new Color(Colors.TURQUOISE3),
  );
  scene.add(boxHelper);
});

const axesHelper = new AxesHelper(30);
scene.add(axesHelper);

const pane = new Pane({ title: 'Debug Pane' });
pane.element.parentElement!.style.width = '380px';
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3,
});

pane.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  min: 0,
  max: 0.1,
});

// EVENTS
function render() {
  fpsGraph.begin();

  // update
  controls.update();
  // render
  renderer.render(scene, camera);
  // animation
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
