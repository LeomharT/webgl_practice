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

const el = document.querySelector('#root');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const textureLoader = new TextureLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.dracoLoader = dracoLoader;

// BASIC
const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 1000);
camera.position.set(5, 1, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// WORLD

const uniforms = {
  uSize: new Uniform(0.2),
  uProgress: new Uniform(0),
  uResolution: new Uniform(new Vector2(sizes.width, sizes.height)),
};

const particles = {
  count: 0,
  positions: [] as Float32BufferAttribute[],
  morph: (_: number) => {},
  index: 0,
};

gltfLoader.load('/models.glb', (data) => {
  const model = data.scene;

  const positions: BufferAttribute[] = model.children.map((obj) => {
    if (obj instanceof Mesh) {
      return obj.geometry.attributes.position;
    }
  });

  for (const p of positions) {
    particles.count = Math.max(particles.count, p.count);
  }

  for (const p of positions) {
    const originArr = p.array;
    const newArr = new Float32Array(particles.count * 3);

    for (let i = 0; i < particles.count; i++) {
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

    particles.positions.push(new Float32BufferAttribute(newArr, 3));
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', particles.positions[0]);
  geometry.setAttribute('aPositionTarget', particles.positions[2]);

  particles.morph = (index: number) => {
    geometry.setAttribute('position', particles.positions[particles.index]);
    geometry.setAttribute('aPositionTarget', particles.positions[index]);

    gsap.fromTo(uniforms.uProgress, { value: 0 }, { value: 1, ease: 'circ', duration: 3 }).play();

    particles.index = index;
  };

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
pane.addBinding(uniforms.uSize, 'value', {
  label: 'Size',
  min: 0,
  max: 0.1,
  step: 0.01,
});
pane.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  min: 0,
  max: 1,
  step: 0.01,
});
pane.addButton({ title: 'Morph 0' }).on('click', () => particles.morph(0));
pane.addButton({ title: 'Morph 1' }).on('click', () => particles.morph(1));
pane.addButton({ title: 'Morph 2' }).on('click', () => particles.morph(2));
pane.addButton({ title: 'Morph 3' }).on('click', () => particles.morph(3));

function render() {
  // UPDATE
  controls.update();
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
