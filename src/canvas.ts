import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CurvePath,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  piexelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.piexelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 0, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

//

const cube = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({ color: Colors.VIOLET3 }));
scene.add(cube);

const lineMaterial = new LineBasicMaterial({ color: 'red', linewidth: 3 });

const curevPath = new CurvePath<Vector3>();
// curevPath.add(new LineCurve3(new Vector3(2, 2, 2), new Vector3(0, 0, 0)));
// curevPath.add(new LineCurve3(new Vector3(0, 0, 0), new Vector3(-3, 3, -3)));
// curevPath.add(new LineCurve3(new Vector3(-3, 3, -3), new Vector3(6, 4, 3)));

curevPath.add(
  new CatmullRomCurve3([new Vector3(2, 2, 2), new Vector3(0, 0, 0), new Vector3(-3, 3, -3), new Vector3(6, 4, 3)]),
);

const lineGeometry = new BufferGeometry();
lineGeometry.setFromPoints(curevPath.getPoints(50));
const line = new Line(lineGeometry, lineMaterial);
scene.add(line);

scene.add(new AxesHelper(1));

let i = 0;

function render() {
  timer.update();
  controls.update();

  i += timer.getDelta() * 0.1;
  i %= 1;

  const position = curevPath.getPointAt(i);
  const direction = curevPath.getTangentAt(i);

  cube.position.copy(position);
  cube.lookAt(position.add(direction));

  //
  renderer.render(scene, camera);
  //
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
