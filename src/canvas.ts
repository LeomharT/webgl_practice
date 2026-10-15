import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
CameraControls.install({ THREE: await import("three") });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(value, min));

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(2, window.devicePixelRatio)
};
const el = document.querySelector('#root') as HTMLDivElement;

const canvas = document.createElement('canvas');
el.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const transform = {
    x: 0, y: 0, scale: 1
};

function clean() {
    ctx.save();

    ctx.resetTransform();
    ctx.fillStyle = Colors.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

const BOX_SIZE = 200;

function renderRect(x: number, y: number) {
    ctx.save();

    ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);
    ctx.fillStyle = Colors.BLUE3;
    ctx.fillRect(x, y, BOX_SIZE * transform.scale, BOX_SIZE * transform.scale);

    ctx.restore();
};

function render() {
    clean();

    renderRect(transform.x, transform.y);
}

function resize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    canvas.width = sizes.width * sizes.dpr;
    canvas.height = sizes.height * sizes.dpr;

    canvas.style.width = sizes.width + 'px';
    canvas.style.height = sizes.height + 'px';

    render();
};
resize();
window.addEventListener('resize', resize);

const prev = { x: 0, y: 0 };
canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);

    prev.x = e.clientX;
    prev.y = e.clientY;
});
canvas.addEventListener('pointerup', e => {
    if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", e => {
    if (!canvas.hasPointerCapture(e.pointerId)) return;

    transform.x += e.clientX - prev.x;
    transform.y += e.clientY - prev.y;

    prev.x = e.clientX;
    prev.y = e.clientY;

    render();
});
canvas.addEventListener('wheel', e => {
    e.preventDefault();

    const next = clamp(
        transform.scale * Math.exp(-e.deltaY * 0.001),
        0.2, 100
    );

    const k = next / transform.scale;

    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
}, { passive: false });