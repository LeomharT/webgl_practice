import { Colors } from '@blueprintjs/colors';
import gsap from 'gsap';
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
scene.background = new Color(Colors.VIOLET1).multiplyScalar(0.3);

const camera = new PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(0, 0, 20);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;

// World
const uniforms = {
  uSize: new Uniform(0.2),
  uResolution: new Uniform(new Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
  uProgress: new Uniform(0),
};

const particles = {
  maxCount: 0,
  positions: [] as BufferAttribute[],
  index: 0,
  morph: null as null | Function,
};

gltfLoader.load('/models.glb', (data) => {
  const positions: BufferAttribute[] = data.scene.children.map((child) => {
    if (child instanceof Mesh) {
      return child.geometry.attributes.position;
    }
  });

  // Get max count
  for (const p of positions) {
    if (p.count > particles.maxCount) particles.maxCount = p.count;
  }

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

  particles.morph = (index: number) => {
    pointGeometey.setAttribute('position', particles.positions[particles.index]);
    pointGeometey.setAttribute('aPositionTarget', particles.positions[index]);

    gsap.fromTo(
      uniforms.uProgress,
      { value: 0 },
      { value: 1, duration: 3, ease: 'linear', onUpdate: () => p.refresh() },
    );

    particles.index = index;
  };

  const pointGeometey = new BufferGeometry();
  pointGeometey.setAttribute('position', particles.positions[particles.index]);

  const pointMaterial = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  const point = new Points(pointGeometey, pointMaterial);
  scene.add(point);
});

// Pane
const pane = new Pane({ title: 'Debug' });
const f_point = pane.addFolder({ title: 'Points' });
f_point.addBinding(uniforms.uSize, 'value', {
  step: 0.01,
  min: 0.1,
  max: 1,
});
const p = f_point.addBinding(uniforms.uProgress, 'value', {
  label: 'progress',
  view: 'interval',
  step: 0.01,
  min: 0,
  max: 1,
});

f_point.addButton({ title: 'Morphing 0' }).on('click', () => particles.morph?.(0));
f_point.addButton({ title: 'Morphing 1' }).on('click', () => particles.morph?.(1));
f_point.addButton({ title: 'Morphing 2' }).on('click', () => particles.morph?.(2));
f_point.addButton({ title: 'Morphing 3' }).on('click', () => particles.morph?.(3));

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
  uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
