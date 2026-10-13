import { Colors } from '@blueprintjs/colors';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(2, devicePixelRatio)
};

const canvas = document.createElement("canvas");
document.querySelector('#root')?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const transform = { x: 0, y: 0, scale: 1 };

function clean() {
    ctx.save();
    ctx.resetTransform();

    ctx.fillStyle = Colors.BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

const BOX_SIZE = 200;

function renderSqure(x: number, y: number) {
    ctx.save();

    ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);
    ctx.fillStyle = Colors.GRAY3;
    ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);

    ctx.restore();
}

function render() {
    clean();
    renderSqure(transform.x, transform.y);
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

const prev = { x: 0, y: 0 };
canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);

    prev.x = e.clientX;
    prev.y = e.clientY;
});
canvas.addEventListener("pointerup", e => {
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