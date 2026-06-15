import { ColliderDesc, RigidBody, RigidBodyDesc, RigidBodyType, World } from '@dimforge/rapier3d';
import { BloomEffect, EffectComposer, EffectPass, FXAAEffect, RenderPass, ToneMappingEffect } from 'postprocessing';
import {
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  Color,
  CubeCamera,
  DoubleSide,
  Group,
  HalfFloatType,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Timer,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three';
import { ThreePerf } from 'three-perf';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { SSGIEffect, VelocityDepthNormalPass } from './lib/realism-effects/v2';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const gravity = { x: 0, y: 0, z: 0 };

const el = document.querySelector('#root');

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff'];

const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
];

const config = {
  importanceSampling: true,
  steps: 20,
  refineSteps: 4,
  spp: 1,
  resolutionScale: 1,
  missedRays: false,
  distance: 5.980000000000011,
  thickness: 2.829999999999997,
  denoiseIterations: 1,
  denoiseKernel: 3,
  denoiseDiffuse: 25,
  denoiseSpecular: 25.54,
  radius: 11,
  phi: 0.5760000000000001,
  lumaPhi: 20.651999999999997,
  depthPhi: 23.37,
  normalPhi: 26.087,
  roughnessPhi: 18.477999999999998,
  specularPhi: 7.099999999999999,
  envBlur: 0.8,
};

const renderer = new WebGLRenderer({
  antialias: false,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = NoToneMapping;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#141622');

const camera = new PerspectiveCamera(17.5, sizes.width / sizes.height, 10, 40);
camera.position.set(0, 0, 30);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const cubeRenderTarget = new WebGLCubeRenderTarget(512, {
  type: HalfFloatType,
  generateMipmaps: true,
  minFilter: LinearFilter,
  magFilter: LinearFilter,
});
const cubeCamera = new CubeCamera(0.1, 1000, cubeRenderTarget);

// Post processing
const composer = new EffectComposer(renderer, {
  alpha: true,
  multisampling: 0,
});
composer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);

const bloomPass = new BloomEffect({
  mipmapBlur: true,
  luminanceThreshold: 0.1,
  intensity: 0.9,
  levels: 7,
});

const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera);
const ssgiEffect = new SSGIEffect(composer, scene, camera, { ...config, velocityDepthNormalPass });

composer.addPass(renderPass);
composer.addPass(velocityDepthNormalPass);
composer.addPass(new EffectPass(camera, ssgiEffect));
composer.addPass(new EffectPass(camera, bloomPass));
composer.addPass(new EffectPass(camera, new FXAAEffect(), new ToneMappingEffect()));

// World

const envScene = new Scene();
const group = new Group();

function createLightFormer(
  form: 'circle' | 'ring' | 'rect' = 'rect',
  intensity: number = 1,
  color: string = 'white',
  scale: number,
  position: [number, number, number],
  rotation: [number, number, number],
) {
  const geometry = {
    circle: new RingGeometry(0, 0.5, 64),
    ring: new RingGeometry(0.25, 0.5, 64),
    rect: new PlaneGeometry(1, 1),
  };
  const material = new MeshBasicMaterial({
    color: new Color(color).multiplyScalar(intensity),
    toneMapped: false,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry[form], material);
  mesh.scale.setScalar(scale);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);

  return mesh;
}

const _lightFormer1 = createLightFormer('circle', 100, 'white', 2, [0, 5, -9], [Math.PI / 2, 0, 0]);
const _lightFormer2 = createLightFormer('circle', 2, 'white', 2, [-5, 1, -1], [0, Math.PI / 2, 0]);
const _lightFormer3 = createLightFormer('circle', 2, 'white', 2, [-5, -1, -1], [0, Math.PI / 2, 0]);
const _lightFormer4 = createLightFormer('circle', 2, 'white', 8, [10, 1, 0], [0, -Math.PI / 2, 0]);
const _lightFormer5 = createLightFormer('ring', 80, '#4060ff', 10, [10, 10, 0], [0, 0, 0]);
_lightFormer5.lookAt(envScene.position);

group.add(_lightFormer1);
group.add(_lightFormer2);
group.add(_lightFormer3);
group.add(_lightFormer4);
group.add(_lightFormer5);
group.rotation.set(-Math.PI / 3, 0, 1);

envScene.add(group);

scene.environment = cubeRenderTarget.texture;
scene.environmentIntensity = 0.15;

let accent = 0;

const world = new World(gravity);
const debug = new LineSegments(new BufferGeometry(), new LineBasicMaterial());
debug.frustumCulled = false;
debug.visible = false;
scene.add(debug);

const spheres: Record<
  string,
  {
    mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
    body: RigidBody;
    accent?: boolean;
  }
> = {};
const sphereGeometry = new SphereGeometry(1, 64, 64);

function createSphere({ accent, ...props }: ReturnType<typeof shuffle>[number]) {
  const material = new MeshStandardMaterial({
    ...props,
  });
  const mesh = new Mesh(sphereGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

for (const i of shuffle(accent)) {
  const sphere = createSphere(i);

  const pos = new Vector3(MathUtils.randFloatSpread(10), MathUtils.randFloatSpread(10), MathUtils.randFloatSpread(10));

  const rigidBodyDesc = RigidBodyDesc.dynamic();
  rigidBodyDesc.setTranslation(pos.x, pos.y, pos.z);
  rigidBodyDesc.setLinearDamping(4);
  rigidBodyDesc.setAngularDamping(1);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  const colliderDesc = ColliderDesc.ball(1);
  colliderDesc.setFriction(0.1);
  world.createCollider(colliderDesc, rigidBody);

  spheres[sphere.uuid] = {
    mesh: sphere,
    body: rigidBody,
    accent: i.accent,
  };

  scene.add(sphere);
}

const pointerRigidBodyDesc = RigidBodyDesc.dynamic();
const pointerRigidBody = world.createRigidBody(pointerRigidBodyDesc);
pointerRigidBody.setBodyType(RigidBodyType.KinematicPositionBased, true);

const pointerColliderDesc = ColliderDesc.ball(1);
world.createCollider(pointerColliderDesc, pointerRigidBody);

const axesHelper = new AxesHelper(5);
axesHelper.visible = false;
scene.add(axesHelper);

const perf = new ThreePerf({
  anchorX: 'left',
  anchorY: 'top',
  domElement: document.body, // or other canvas rendering wrapper
  renderer: renderer, // three js renderer instance you use for rendering
});

// Events

function updateDebug() {
  const { vertices, colors } = world.debugRender();

  debug.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  debug.geometry.setAttribute('color', new BufferAttribute(colors, 4));
}

const c = new Color();
const v = new Vector3();
const lambda = 2.5;

function updateSphere(delta: number) {
  c.set(accents[accent]);

  for (const key in spheres) {
    const { mesh, body, accent: isAccent } = spheres[key];

    mesh.position.copy(body.translation());
    mesh.quaternion.copy(body.rotation());

    body.applyImpulse(v.copy(body.translation()).negate().multiplyScalar(0.2), true);

    if (isAccent) {
      mesh.material.color.r = MathUtils.damp(mesh.material.color.r, c.r, lambda, delta);
      mesh.material.color.g = MathUtils.damp(mesh.material.color.g, c.g, lambda, delta);
      mesh.material.color.b = MathUtils.damp(mesh.material.color.b, c.b, lambda, delta);
    }
  }
}

function click() {
  accent = ++accent % accents.length;
}

function render() {
  perf.begin();

  // Update
  timer.update();

  const delta = timer.getDelta();

  world.step();
  controls.update();

  updateSphere(delta);
  updateDebug();

  // Render

  cubeCamera.update(renderer, envScene);

  renderer.autoClear = true;
  composer.render(delta);

  perf.end();

  //Animation
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

window.addEventListener('pointermove', (e) => {
  const x = (e.clientX / sizes.width) * 2.0 - 1.0;
  const y = -(e.clientY / sizes.height) * 2.0 + 1.0;

  pointerRigidBody.setNextKinematicTranslation({ x: x * 3, y: y * 3, z: 0 });
});

window.addEventListener('pointerdown', click);
