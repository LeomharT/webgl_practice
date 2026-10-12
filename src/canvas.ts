import { Colors } from '@blueprintjs/colors';

const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(value, min));
};
const mod = (n: number, m: number) => ((n % m) + m) % m;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(2, window.devicePixelRatio)
};

const transform = { x: 0, y: 0, scale: 1 };

const canvas = document.createElement("canvas");
document.querySelector("#root")?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clean() {
    ctx.save();

    ctx.resetTransform();
    ctx.fillStyle = Colors.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}


function drawGrid(step: number, color: string, dash?: [number, number]) {
    ctx.save();

    ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);

    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    if (dash) ctx.setLineDash(dash);

    // Storke Y
    ctx.beginPath();
    for (let i = mod(transform.x, step); i < canvas.width; i += step) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    ctx.stroke();

    // Storke X
    ctx.beginPath();
    for (let i = mod(transform.y, step); i < canvas.height; i += step) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    ctx.restore();
}

function render() {
    const MAJOR_CELL_SIZE = 100 * transform.scale;
    const MINOR_CELL_SIZE = MAJOR_CELL_SIZE / 5;

    clean();

    if (transform.scale > 0.5) {
        drawGrid(MINOR_CELL_SIZE, transform.scale < 0.7 ? Colors.DARK_GRAY1 : Colors.DARK_GRAY2, [3, 3]);
    }
    drawGrid(MAJOR_CELL_SIZE, Colors.DARK_GRAY5);
}

function resize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    canvas.width = sizes.width * sizes.dpr;
    canvas.height = sizes.height * sizes.dpr;

    canvas.style.width = sizes.width + 'px';
    canvas.style.height = sizes.height + 'px';

    render();
}
resize();
window.addEventListener('resize', resize);

let prev = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);

    prev.x = e.clientX;
    prev.y = e.clientY;
});
canvas.addEventListener('pointerup', e => {
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
    if (!canvas.hasPointerCapture(e.pointerId)) return;

    transform.x += e.clientX - prev.x;
    transform.y += e.clientY - prev.y;

    prev.x = e.clientX;
    prev.y = e.clientY;

    render();
});
canvas.addEventListener('wheel', e => {
    e.preventDefault();

    const next = clamp(transform.scale * Math.exp(-e.deltaY * 0.001), 0.2, 100); // Scale speed

    const k = next / transform.scale;

    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
}, { passive: false });