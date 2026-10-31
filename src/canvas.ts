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
const trasnform = {
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
    sizes.dpr * trasnform.scale,
    0,
    0,
    sizes.dpr * trasnform.scale,
    x,
    y,
  );
  ctx.fillStyle = Colors.ROSE5;
  ctx.fillRect(0, 0, 200, 200);

  ctx.restore();
}

function render() {
  clean();
  testRender(trasnform.x, trasnform.y);
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

  trasnform.x += e.clientX - prev.x;
  trasnform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  requestRender();
});

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const next = MathUtils.clamp(
      trasnform.scale * Math.exp(-e.deltaY * 0.001),
      0.2,
      1000,
    );

    const k = next / trasnform.scale;
    trasnform.x = e.offsetX - (e.offsetX - trasnform.x) * k;
    trasnform.y = e.offsetY - (e.offsetY - trasnform.y) * k;

    trasnform.scale = next;

    console.log(trasnform.scale);

    requestRender();
  },
  { passive: false },
);
