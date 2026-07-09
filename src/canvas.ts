import { Colors } from '@blueprintjs/colors';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  NearestMipMapNearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import { PackedMipMapGenerator } from './lib/custom-mipmap-generation/PackedMipMapGenerator';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();

const params = {
  linearFilter: false,
  mipLevel: 0,
  sampleType: 0,
  powerOfTwo: false,
};

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
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;

const linearTarget = new WebGLRenderTarget();
const nearestTarget = new WebGLRenderTarget();
nearestTarget.texture.minFilter = NearestFilter;
nearestTarget.texture.magFilter = NearestFilter;

const imgTexture = textureLoader.load('voyager-record-cover.jpg', () => {
  updateTexture();
});
imgTexture.colorSpace = SRGBColorSpace;

// World
const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
const planeMaterial = new MeshBasicMaterial({
  map: imgTexture,
  side: DoubleSide,
});
const plane = new Mesh(planeGeometry, planeMaterial);
// plane.scale.x = 1.5;
scene.add(plane);

// Pane
const pane = new Pane({ title: 'Debug' });

function updateTexture() {
  const texture = imgTexture;

  texture.minFilter = NearestMipMapNearestFilter;
  texture.generateMipmaps = false;

  // render mip pyramids
  const mipMapper = new PackedMipMapGenerator();
  mipMapper.update(texture, nearestTarget, renderer);
  mipMapper.update(texture, linearTarget, renderer);

  // render original target
  const copyQuad = mipMapper._copyQuad;
  (copyQuad.material as ShaderMaterial).uniforms.tDiffuse.value = texture;
  copyQuad.camera.setViewOffset(1, 1, 0, 0, 1, 1);

  renderer.setRenderTarget(null);

  // dipose
  mipMapper.dispose();

  plane.material.map = nearestTarget.texture;
  plane.material.needsUpdate = true;
}

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
