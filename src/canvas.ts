import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
CameraControls.install({ THREE: await import("three") });

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
    ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);

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