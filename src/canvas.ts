import { Colors } from '@blueprintjs/colors';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const textureLoader = new TextureLoader();

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

const dayMap = textureLoader.load('2k_earth_daymap.jpg');
dayMap.colorSpace = SRGBColorSpace;

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
camera.position.set(0, 0, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;

// World

const geometry1 = new PlaneGeometry(1, 1, 32, 32);
geometry1.scale(1.618, 1, 1);
geometry1.setIndex(null);

const geometry2 = new SphereGeometry(0.5, 32, 32);
geometry2.setIndex(null);

const particle = {
  maxCount: Math.max(geometry1.getAttribute('position').count, geometry2.getAttribute('position').count),
  positions: [] as Float32BufferAttribute[],
};

const positions = [geometry1.getAttribute('position'), geometry2.getAttribute('position')];

for (const p of positions) {
  const originArray = p.array;
  const newArray = new Float32Array(particle.maxCount * 3);

  for (let i = 0; i < particle.maxCount; i++) {
    const i3 = i * 3;

    if (i3 < originArray.length) {
      newArray[i3 + 0] = originArray[i3 + 0];
      newArray[i3 + 1] = originArray[i3 + 1];
      newArray[i3 + 2] = originArray[i3 + 2];
    } else {
      const randomIndex = Math.floor(Math.random() * p.count) * 3;

      newArray[i3 + 0] = originArray[randomIndex + 0];
      newArray[i3 + 1] = originArray[randomIndex + 1];
      newArray[i3 + 2] = originArray[randomIndex + 2];
    }
  }

  particle.positions.push(new Float32BufferAttribute(newArray, 3));
}

const geometry = new BufferGeometry();
geometry.setAttribute('position', particle.positions[0]);
geometry.setAttribute('aPositionTarget', particle.positions[1]);

const uniforms = {
  uSize: new Uniform(0.05),
  uProgress: new Uniform(0.0),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uDayMap: new Uniform(dayMap),
};

const pointMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  depthWrite: false,
  blending: AdditiveBlending,
});
const points = new Points(geometry, pointMaterial);

scene.add(points);

const pane = new Pane({ title: 'Debug' });
const f_point = pane.addFolder({ title: 'Point' });

f_point.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  step: 0.01,
  max: 1,
  min: 0,
});
f_point.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  step: 0.01,
  min: 0,
  max: 1,
});

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
  uniforms.uResolution.value.set(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
