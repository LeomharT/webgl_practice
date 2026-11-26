import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
import {
  atan,
  cameraPosition,
  color,
  Fn,
  HALF_PI,
  instancedBufferAttribute,
  materialColor,
  mix,
  positionLocal,
  rotate,
  uv,
} from 'three/tsl';
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
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
  Scene,
  Timer,
  WebGPURenderer,
} from 'three/webgpu';
CameraControls.install({ THREE: await import('three') });

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

/**
 * Basic
 */
const renderer = new WebGPURenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.setAnimationLoop(render);
document.querySelector('#root')?.append(renderer.domElement);

const inspector = new Inspector();
renderer.inspector = inspector;

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, size.width / size.height, 0.1, 1000);
camera.position.set(0, 1, 1);
camera.lookAt(scene.position);

const controls = new CameraControls(camera, renderer.domElement);
controls.dollySpeed = 0.256;

const timer = new Timer();

/**
 * World
 */

const floorGeometry = new PlaneGeometry(1.05, 1.05, 1, 1);
const floorMaterial = new MeshBasicNodeMaterial();
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Grass
class Grass {
  constructor(count: number = 400) {
    this._count = count;

    this._geometry = this._setupGeometry();
    this._material = this._setupMaterial();
    this.mesh = this._setupMesh();
  }

  private _count: number;

  private _geometry: BufferGeometry;

  private _material: MeshStandardNodeMaterial;

  public mesh: Mesh;

  private _setupGeometry() {
    // Position attribute
    const posArr = new Float32Array([
      // v1
      0, 1, 0,
      // v2
      -0.5, 0, 0,
      // v2
      0.5, 0, 0,
    ]);
    const posBuffer = new Float32BufferAttribute(posArr, 3);

    // UV attribute
    const uvArr = new Float32Array([
      // v1
      0.5, 1,
      // v2
      0.0, 0.0,
      // v3
      1.0, 0.0,
    ]);
    const uvBuffer = new Float32BufferAttribute(uvArr, 2);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', posBuffer);
    geometry.setAttribute('uv', uvBuffer);
    geometry.computeVertexNormals();

    return geometry;
  }

  private _setupMaterial() {
    const material = new MeshStandardNodeMaterial({});

    // Translate
    const positionsArr = new Float32Array(this._count * 3);
    const positionBuffer = new InstancedBufferAttribute(positionsArr, 3);

    // Scale
    const scaleArr = new Float32Array(this._count * 3);
    const scaleBuffer = new InstancedBufferAttribute(scaleArr, 3);

    for (let i = 0; i < this._count; i++) {
      const i3 = i * 3;

      positionsArr[i3 + 0] = MathUtils.randFloat(-0.5, 0.5);
      positionsArr[i3 + 1] = 0;
      positionsArr[i3 + 2] = MathUtils.randFloat(-0.5, 0.5);

      const randomScale = MathUtils.randFloat(0.05, 0.1);
      scaleArr[i3 + 0] = randomScale;
      scaleArr[i3 + 1] = 0.1;
      scaleArr[i3 + 2] = randomScale;
    }

    material.positionNode = Fn(() => {
      const position = instancedBufferAttribute(positionBuffer, 'vec3') as Node<'vec3'>;
      const scale = instancedBufferAttribute(scaleBuffer, 'vec3') as Node<'vec3'>;

      positionLocal.mulAssign(scale);

      const angle = atan(cameraPosition.z.sub(position.z), cameraPosition.x.sub(position.x));
      angle.subAssign(HALF_PI);
      positionLocal.xz.assign(rotate(positionLocal.xz, angle));

      positionLocal.addAssign(position);

      return positionLocal;
    })();

    material.colorNode = Fn(() => {
      const c = materialColor.toVar();

      c.assign(mix(color(Colors.GREEN1), color(Colors.GREEN5), uv().y));

      return c;
    })();

    return material;
  }

  private _setupMesh() {
    const mesh = new Mesh(this._geometry, this._material);
    mesh.count = this._count;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
  }
}

const grass = new Grass(2500);
scene.add(grass.mesh);

const ballGeometry = new IcosahedronGeometry(0.2, 5);
const ballMaterial = new MeshStandardNodeMaterial({
  color: Colors.VIOLET3,
});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.2;
ball.castShadow = true;
ball.receiveShadow = true;
scene.add(ball);

/**
 * Light
 */
const ambientLight = new AmbientLight(Colors.BLUE3, 1);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(Colors.GOLD3, 2);
directionalLight.position.set(3, 3, 3);
directionalLight.castShadow = true;
scene.add(directionalLight);

/**
 * Events
 */
function render() {
  // Update
  timer.update();
  const dt = timer.getDelta();

  controls.update(dt);

  // Render
  renderer.render(scene, camera);
}
