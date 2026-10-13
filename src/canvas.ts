import { Colors } from '@blueprintjs/colors';
import { AxesHelper, Color, MathUtils, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from 'three';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(2, window.devicePixelRatio)
};
const el = document.querySelector('#root') as HTMLDivElement;

const transform = {
    x: 0,
    y: 0,
    scale: 1
};

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.dpr);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, sizes.width / sizes.height, 0.01, 100);
camera.position.set(0, 0, 1);
camera.lookAt(scene.position);

// Scene
const planeGeometry = new PlaneGeometry(1, 1, 1, 1,);
const planeMaterial = new MeshBasicMaterial({ color: 'white' });
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);


const axesHelper = new AxesHelper();
scene.add(axesHelper);


function render() {
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

renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();

    const next = MathUtils.clamp(
        transform.scale * Math.exp(e.deltaY * 0.001),
        0.2,
        100
    );

    const k = next / transform.scale;

    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    camera.position.x = transform.x * 0.001;
    camera.position.y = transform.y * 0.001;

    console.log(transform);

    camera.position.z = transform.scale;

}, { passive: false });