import { Colors } from '@blueprintjs/colors';
import { AxesHelper, Color, MathUtils, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, PlaneGeometry, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three';

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

renderer.domElement.addEventListener('pointerdown', e => {
    console.log((e.clientX / sizes.width) * 2 - 1);
    console.log(-(e.clientY / sizes.height) * 2 + 1);
});

const mouse = new Vector2();
const raycaster = new Raycaster();

// 世界空间中 z = 0 的平面
const ground = new Plane(
    new Vector3(0, 0, 1),
    0
);

const before = new Vector3();
const after = new Vector3();

function getWorldPoint(e: WheelEvent, target: Vector3) {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    camera.updateMatrixWorld();

    raycaster.setFromCamera(mouse, camera);

    return raycaster.ray.intersectPlane(ground, target);
}

renderer.domElement.addEventListener(
    'wheel',
    e => {
        e.preventDefault();

        // 1. 缩放前鼠标指向的世界坐标
        if (!getWorldPoint(e, before)) return;

        // 2. 计算新的相机距离
        const nextZ = MathUtils.clamp(
            camera.position.z * Math.exp(e.deltaY * 0.001),
            0.2,
            100
        );

        // 3. 修改相机 Z
        camera.position.z = nextZ;

        // 4. 缩放后再次求交点
        if (!getWorldPoint(e, after)) return;

        // 5. 根据两次交点差补偿相机位置
        camera.position.x += before.x - after.x;
        camera.position.y += before.y - after.y;
    },
    { passive: false }
);