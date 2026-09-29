import { Colors } from '@blueprintjs/colors';

const clamp = (value: number, minVal: number, maxVal: number) =>
  Math.max(minVal, Math.min(value, maxVal));

const mod = (n: number, m: number) => ((n % m) + m) % m;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const el = document.querySelector('#root');
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const prev = { x: 0, y: 0 };
const transform = { x: 0, y: 0, scale: 1 };

const MAJOR_COLOR = Colors.DARK_GRAY5;
const MINOR_COLOR = Colors.DARK_GRAY2;
const MINOR_COLOR_LIGHT = Colors.DARK_GRAY1;

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
  render();
}
resize();

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderGrid(step: number, color: string, dash?: [number, number]) {
  ctx.save();

  const { width, height } = sizes;

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, 0, 0);
  ctx.strokeStyle = color;
  if (dash) ctx.setLineDash(dash);

  ctx.beginPath();
  for (let x = transform.x % step; x < width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let y = transform.y % step; y < height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  ctx.restore();
}

function renderSquire() {
  ctx.save();

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, 0, 0);
  ctx.fillStyle = Colors.ROSE1;
  ctx.fillRect(
    transform.x,
    transform.y,
    100 * transform.scale,
    100 * transform.scale,
  );

  ctx.restore();
}

function render() {
  clean();

  const MAJOR_CELL = 100 * transform.scale;
  const MINOR_CELL = MAJOR_CELL / 5;

  if (transform.scale > 0.5)
    renderGrid(
      MINOR_CELL,
      transform.scale > 0.7 ? MINOR_COLOR : MINOR_COLOR_LIGHT,
      [3, 3],
    );
  renderGrid(MAJOR_CELL, MAJOR_COLOR);

  renderSquire();
}

let isPending = false;

window.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  isPending = true;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

window.addEventListener('pointerup', (e) => {
  isPending = false;
  canvas.releasePointerCapture(e.pointerId);
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  render();
});

window.addEventListener('resize', resize);

window.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const next = clamp(transform.scale * Math.exp(-e.deltaY * 0.001), 0.2, 100);

    const k = next / transform.scale;
    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
  },
  { passive: false },
);
