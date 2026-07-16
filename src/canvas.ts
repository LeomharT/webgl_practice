import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
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
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(10, 8, 10);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD

const uniforms = {
  // FLOAT
  uSize: new Uniform(0.4),
  uProgress: new Uniform(0.0),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
};

const particle = {
  maxCount: 0,
  position: [] as Float32BufferAttribute[],
};

gltfLoader.load('models.glb', (data) => {
  const positions: BufferAttribute[] = data.scene.children.map((value) => {
    if (value instanceof Mesh) return value.geometry.attributes.position;
  });

  for (const p of positions) {
    if (p.count > particle.maxCount) particle.maxCount = p.count;
  }

  for (const p of positions) {
    const originArr = p.array;
    const newArr = new Float32Array(particle.maxCount * 3);

    for (let i = 0; i < particle.maxCount; i++) {
      const i3 = i * 3;

      if (i3 < originArr.length) {
        newArr[i3 + 0] = originArr[i3 + 0];
        newArr[i3 + 1] = originArr[i3 + 1];
        newArr[i3 + 2] = originArr[i3 + 2];
      } else {
        const randomIndex = Math.floor(Math.random() * p.count) * 3;

        newArr[i3 + 0] = originArr[randomIndex + 0];
        newArr[i3 + 1] = originArr[randomIndex + 1];
        newArr[i3 + 2] = originArr[randomIndex + 2];
      }
    }

    particle.position.push(new Float32BufferAttribute(newArr, 3));
  }

  // Random Size
  const sizes = new Float32Array(particle.maxCount);
  for (let i = 0; i < particle.maxCount; i++) {
    sizes[i] = Math.random();
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', particle.position[0]);
  geometry.setAttribute('aTargetPosition', particle.position[1]);
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));

  const pointMaterial = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, pointMaterial);
  scene.add(points);
});

const pane = new Pane({ title: 'Debug Pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: 'fps',
});

const f_point = pane.addFolder({ title: 'Point' });
f_point.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  min: 0,
  max: 1,
  step: 0.01,
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

  renderer.setSize(sizes.width, sizes.height);
  uniforms.uResolution.value.set(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
