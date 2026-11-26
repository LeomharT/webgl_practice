import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicNodeMaterial,
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

const floorGeometry = new PlaneGeometry(1, 1, 1, 1);
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

  private _material: MeshBasicNodeMaterial;

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

    return geometry;
  }

  private _setupMaterial() {
    const material = new MeshBasicNodeMaterial();

    return material;
  }

  private _setupMesh() {
    const mesh = new Mesh(this._geometry, this._material);
    mesh.count = this._count;

    return mesh;
  }
}

const grass = new Grass();
scene.add(grass.mesh);

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
