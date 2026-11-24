import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import {
  and,
  atan,
  cameraPosition,
  color,
  Discard,
  Fn,
  HALF_PI,
  If,
  instancedBufferAttribute,
  materialColor,
  mix,
  mx_noise_float,
  pass,
  positionLocal,
  reflector,
  renderOutput,
  rotate,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  MathUtils,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  Node,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RenderPipeline,
  Scene,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';

CameraControls.install({ THREE: await import('three/webgpu') });

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, devicePixelRatio),
};

const inspector = new Inspector();

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.setAnimationLoop(render);
renderer.inspector = inspector;
renderer.autoClear = true;
document.querySelector('#root')?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 1, 1);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.dollySpeed = 0.35;
controls.maxDistance = 20;
controls.minDistance = 0.2;

const timer = new Timer();

/**
 * Render pipline
 */

const renderPipline = new RenderPipeline(renderer);
renderPipline.outputColorTransform = false;

// Scene pass
const scenePass = pass(scene, camera);

const bloomPass = bloom(scenePass, 0.78, 0.5, 2.0);
renderPipline.outputNode = scenePass.add(bloomPass);

renderPipline.outputNode = renderOutput(renderPipline.outputNode);

const fxaaPass = fxaa(renderPipline.outputNode);
renderPipline.outputNode = fxaaPass;

/**
 * World
 */

const floorGeometry = new PlaneGeometry(1, 1, 1, 1);
const floorMaterial = new MeshStandardNodeMaterial({
  roughness: 0.4,
  metalness: 0.3,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;

floorMaterial.colorNode = Fn(() => {
  const color = materialColor.add(
    reflector({
      resolutionScale: 1,
      target: floor,
      bounces: true,
      generateMipmaps: false,
    }),
  );

  return color;
})();

scene.add(floor);

// Grass
const grassPositionArray = new Float32Array([
  0.0, 1.0, 0.0, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0,
]);
const grassUVArray = new Float32Array([0.5, 1.0, 0.0, 0.0, 1.0, 0.0]);

const grassGeometry = new BufferGeometry();
grassGeometry.setAttribute(
  'position',
  new BufferAttribute(grassPositionArray, 3),
);
grassGeometry.setAttribute('uv', new BufferAttribute(grassUVArray, 2));
grassGeometry.computeVertexNormals();

const grassMaterial = new MeshBasicNodeMaterial({
  color: new Color(Colors.GREEN4),
});

const count = 1000;

const positionArray = new Float32Array(count * 3);
const positionBuffer = new InstancedBufferAttribute(positionArray, 3);

const scaleArray = new Float32Array(count * 3);
const scaleBuffer = new InstancedBufferAttribute(scaleArray, 3);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;

  positionArray[i3 + 0] = MathUtils.randFloat(-0.5, 0.5);
  positionArray[i3 + 1] = 0;
  positionArray[i3 + 2] = MathUtils.randFloat(-0.5, 0.5);

  const randomScale = MathUtils.randFloat(0.05, 0.1);

  scaleArray[i3 + 0] = randomScale;
  scaleArray[i3 + 1] = 0.1;
  scaleArray[i3 + 2] = randomScale;
}

grassMaterial.positionNode = Fn(() => {
  const position = instancedBufferAttribute(
    positionBuffer,
    'vec3',
  ) as Node<'vec3'>;
  const scale = instancedBufferAttribute(scaleBuffer, 'vec3') as Node<'vec3'>;

  // Rotate
  const angle = atan(
    cameraPosition.z.sub(position.z),
    cameraPosition.x.sub(position.x),
  ).sub(HALF_PI);

  positionLocal.xz.assign(rotate(positionLocal.xz, angle));
  // Scale
  positionLocal.mulAssign(scale);
  // Translate
  positionLocal.addAssign(position);

  return positionLocal;
})();

grassMaterial.colorNode = Fn(() => {
  const diffuse = mix(color(Colors.GREEN1), color(Colors.GREEN5), uv().y);
  return diffuse;
})();

const grass = new Mesh(grassGeometry, grassMaterial);
grass.count = count;
scene.add(grass);

const progressUniform = uniform(0, 'float');

const ballGui = inspector.createParameters('Ball');
ballGui.add(progressUniform, 'value', 0, 1, 0.01).name('Progress');

const ballGeometry = new IcosahedronGeometry(0.1, 32);
const ballMaterial = new MeshStandardNodeMaterial({
  color: Colors.VIOLET3,
});

ballMaterial.colorNode = Fn(({ material }) => {
  const random = mx_noise_float(positionLocal.mul(50)).toVar();
  random.assign(random.mul(0.5).add(0.5));

  const color = materialColor.toVar();

  If(random.lessThanEqual(progressUniform), () => {
    Discard();
  });

  If(
    and(
      random.lessThanEqual(progressUniform.add(0.1)),
      progressUniform.greaterThan(0),
    ),
    () => {
      color.assign(vec3(3.0));
    },
  );

  return color;
})();

const ball = new Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.2;
scene.add(ball);

// Lights
const lightGui = inspector.createParameters('Lishts');

const ambientLight = new AmbientLight('#5b95e6', 2);
scene.add(ambientLight);

const ambientLightGui = lightGui.addFolder('Ambient Lisht');
ambientLightGui.addColor(ambientLight, 'color').name('Ambient Color');

const directionalLight = new DirectionalLight('#f0cc99', 3);
directionalLight.position.set(3, 3, 3);
scene.add(directionalLight);

const directionalLightGui = lightGui.addFolder('Ambient Lisht');
directionalLightGui
  .addColor(directionalLight, 'color')
  .name('Directional Color');

// Tick function
function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderPipline.render();
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
