import { Colors } from '@blueprintjs/colors';

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
  x: sizes.width / 2,
  y: sizes.height / 2,
  scale: 1,
  rotate: 0,
};

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.BLACK;
  ctx.resetTransform();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderRect() {
  ctx.save();

  const c = Math.cos(transform.rotate) * sizes.dpr;
  const s = Math.sin(transform.rotate) * sizes.dpr;

  const size = 100;

  ctx.setTransform(
    c,
    s,
    -s,
    c,
    transform.x * sizes.dpr,
    transform.y * sizes.dpr,
  );

  ctx.fillStyle = Colors.CERULEAN4;
  ctx.fillRect(-size / 2, -size / 2, size, size);

  ctx.restore();
}

function render() {
  clean();

  renderRect();
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

const prev = { x: 0, y: 0, rotate: 0 };

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  prev.x = e.clientX;
  prev.y = e.clientY;

  prev.rotate = Math.atan2(prev.y - transform.y, prev.x - transform.x);
});

canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  // transform.x += e.clientX - prev.x;
  // transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  const angle = Math.atan2(prev.y - transform.y, prev.x - transform.x);

  transform.rotate += angle - prev.rotate;
  prev.rotate = angle;

  requestRender();
});
