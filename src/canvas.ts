import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
document.querySelector('#root')?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  sizes.dpr = Math.min(2, window.devicePixelRatio);

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  requestRender();
}

let frameId: number | null = null;
const transform = {
  x: 0,
  y: 0,
  scale: 1,
};

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.BLACK;
  ctx.resetTransform();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function testRender(x: number, y: number) {
  ctx.save();

  ctx.transform(
    sizes.dpr * transform.scale,
    0,
    0,
    sizes.dpr * transform.scale,
    x,
    y,
  );
  ctx.fillStyle = Colors.ROSE5;
  ctx.fillRect(0, 0, 200, 200);

  ctx.restore();
}

const DOT_STEP = 50;

function renderDots(tx: number, ty: number) {
  ctx.save();

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);

  let radius = 6 * transform.scale;
  radius = Math.min(2, radius);

  ctx.fillStyle = Colors.WHITE;

  const step = DOT_STEP * transform.scale;

  let i = 0;

  for (let x = tx; x < sizes.width; x += step) {
    for (let y = ty; y < sizes.height; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      i++;
    }
  }

  console.log(i);

  ctx.restore();
}

function render() {
  clean();
  renderDots(transform.x, transform.y);
}

function requestRender() {
  if (frameId) return;

  frameId = requestAnimationFrame(() => {
    frameId = null;
    render();
  });
}

resize();
window.addEventListener('resize', resize);

const prev = { x: 0, y: 0 };

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  prev.x = e.clientX;
  prev.y = e.clientY;
});

canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  requestRender();
});

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const next = MathUtils.clamp(
      transform.scale * Math.exp(-e.deltaY * 0.001),
      0.2,
      1000,
    );

    const k = next / transform.scale;
    transform.x = e.offsetX - (e.offsetX - transform.x) * k;
    transform.y = e.offsetY - (e.offsetY - transform.y) * k;

    transform.scale = next;

    console.log(transform.scale);

    requestRender();
  },
  { passive: false },
);
