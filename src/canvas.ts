import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderChunk,
  ShaderMaterial,
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
renderer.toneMapping = ACESFilmicToneMapping;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.VIOLET1).multiplyScalar(0.1);

const camera = new PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(10, 8, 10);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD
const uniforms = {
  uSize: new Uniform(0.22),
  uProgress: new Uniform(0),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
  uColorA: new Uniform(new Color(Colors.GOLD3)),
  uColorB: new Uniform(new Color(Colors.VIOLET4)),
};

const particles = {
  maxCount: 0,
  positions: [] as Float32BufferAttribute[],
};

gltfLoader.load('/models.glb', (data) => {
  const models = data.scene;

  const positions: BufferAttribute[] = models.children.map((value) => {
    if (value instanceof Mesh) {
      return value.geometry.attributes.position;
    }
  });

  for (const p of positions) particles.maxCount = Math.max(particles.maxCount, p.count);

  for (const p of positions) {
    const originArray = p.array;
    const newArray = new Float32Array(particles.maxCount * 3);

    for (let i = 0; i < particles.maxCount; i++) {
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

    particles.positions.push(new Float32BufferAttribute(newArray, 3));
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', particles.positions[0]);
  geometry.setAttribute('aPositionTarget', particles.positions[1]);

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  scene.add(points);
});

const pane = new Pane({ title: 'Debug Pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
});

const f_point = pane.addFolder({ title: 'Point' });
f_point.addBinding(uniforms.uSize, 'value', {
  label: 'size',
  step: 0.01,
  min: 0,
  max: 1,
});
f_point.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  min: 0,
  max: 1,
  step: 0.01,
});

function render() {
  fpsGraph.begin();
  // Update
  controls.update();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
  fpsGraph.end();
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  uniforms.uResolution.value.set(sizes.width, sizes.height);
  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
