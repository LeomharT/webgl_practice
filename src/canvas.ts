import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { AxesHelper, BoxGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Timer, WebGLRenderer } from 'three';
CameraControls.install({ THREE: await import("three") });

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(2, window.devicePixelRatio)
};
const el = document.querySelector('#root') as HTMLDivElement;

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.dpr);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 100);
camera.position.set(0, 0, 1);
camera.lookAt(scene.position);

const c = new CameraControls(camera, renderer.domElement);
c.enabled = true;
c.dollySpeed = 0.2;
c.dollyToCursor = true;

const t = new Timer();

// Scene
const planeGeometry = new BoxGeometry(0.3, 0.3, 0.3, 2, 2, 2);
const planeMaterial = new MeshBasicMaterial({ color: 'white' });
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

function render() {
    t.update();

    const dt = t.getDelta();
    c.update(dt);

    renderer.render(scene, camera);

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