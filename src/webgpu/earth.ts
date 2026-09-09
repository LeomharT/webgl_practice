import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import {
  cameraPosition,
  color,
  dot,
  float,
  mix,
  normalLocal,
  normalWorld,
  positionWorld,
  reflect,
  texture,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardNodeMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu';
import { Pane } from 'tweakpane';
import '../style.css';

const el = document.querySelector('#root') as HTMLDivElement;
el.style.background = Colors.BLACK;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x111111);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  1000,
);
camera.position.set(3, 2.5, 1.5);
camera.lookAt(scene.position);

const timer = new Timer();
timer.connect(document);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const textLoader = new TextureLoader();

const dayMapTexture = textLoader.load('/2k_earth_daymap.jpg');
dayMapTexture.colorSpace = SRGBColorSpace;
dayMapTexture.anisotropy = 16;

const nightMapTexture = textLoader.load('/2k_earth_nightmap.jpg');
nightMapTexture.colorSpace = SRGBColorSpace;
nightMapTexture.anisotropy = 16;

const specularCloudTexture = textLoader.load('/specularClouds.jpg');

// SUN

const uSunDirection = uniform(vec3());
const uColorTwililight = uniform(color(Colors.VERMILION3));
const uColorAtmospherelight = uniform(color(Colors.CERULEAN4));

const sunPosition = new Vector3();
const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);

function updateSun() {
  sunPosition.setFromSpherical(sunSpherical);
  uSunDirection.value.copy(sunPosition);
  sun.position.copy(sunPosition.clone().multiplyScalar(2));
}

const sunGeo = new IcosahedronGeometry(0.03, 3);
const sunMat = new MeshBasicMaterial({
  color: Colors.GOLD5,
});
const sun = new Mesh(sunGeo, sunMat);
updateSun();
scene.add(sun);

// EARTH
{
  const geometry = new SphereGeometry(1, 64, 64);
  const material = new MeshStandardNodeMaterial();

  const sunDirection = uSunDirection.normalize();
  const orientation = dot(normalWorld, sunDirection);

  const dayMix = orientation.smoothstep(-0.25, 0.5);

  const color = mix(
    texture(nightMapTexture, uv()),
    texture(dayMapTexture, uv()),
    dayMix,
  );

  const specularCloudColor = texture(specularCloudTexture, uv());

  const cloudMix = specularCloudColor.g.smoothstep(0.3, 1.0);
  const cloud = mix(color, vec3(1.0), cloudMix.mul(dayMix));

  const viewDirection = positionWorld.sub(cameraPosition).normalize();
  const fresnel = float(1.0).add(dot(normalWorld, viewDirection)).pow2();

  const atmosphereMix = orientation.smoothstep(0.0, 0.5);

  const atmosphere = mix(
    uColorTwililight,
    uColorAtmospherelight,
    atmosphereMix,
  );

  const reflector = reflect(sunDirection, normalLocal).normalize();
  const specularColor = mix(vec3(1.0), uColorTwililight, fresnel);
  const specular = dot(reflector, viewDirection)
    .max(0)
    .pow(20.0)
    .mul(specularCloudColor.r)
    .mul(specularColor);

  const finalNode = mix(cloud, atmosphere, fresnel.mul(dayMix));

  material.fragmentNode = finalNode.add(specular);

  const earth = new Mesh(geometry, material);
  scene.add(earth);
}

const pane = new Pane({ title: 'Debug pane' });
// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);
// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
});

const f_sun = pane.addFolder({ title: 'SUN' });
f_sun
  .addBinding(sunSpherical, 'phi', {
    step: 0.01,
    min: 0,
    max: Math.PI,
  })
  .on('change', updateSun);
f_sun
  .addBinding(sunSpherical, 'theta', {
    step: 0.01,
    min: -Math.PI,
    max: Math.PI,
  })
  .on('change', updateSun);

const f_earth = pane.addFolder({ title: 'Earth' });
f_earth.addBinding(uColorAtmospherelight, 'value', {
  color: { type: 'float' },
  label: 'Atmospherelight',
});
f_earth.addBinding(uColorTwililight, 'value', {
  color: { type: 'float' },
  label: 'Twililight',
});
renderer.setAnimationLoop(render);

function render() {
  fpsGraph.begin();

  // UPDATE
  timer.update();
  controls.update();
  // RENDER
  renderer.render(scene, camera);

  fpsGraph.end();
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
