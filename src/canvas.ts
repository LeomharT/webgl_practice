import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
CameraControls.install({ THREE: await import('three') });

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(value, min));

const mod = (n: number, m: number) => ((n % m) + m) % m;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root') as HTMLDivElement;

const canvas = document.createElement('canvas');
el.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const BOX_SIZE = 200;

const transform = {
  x: sizes.width / 2 - BOX_SIZE / 2,
  y: sizes.height / 2 - BOX_SIZE / 2,
  scale: 1,
};

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderRect(x: number, y: number) {
  ctx.save();

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);
  ctx.fillStyle = Colors.BLUE3;
  ctx.fillRect(x, y, BOX_SIZE * transform.scale, BOX_SIZE * transform.scale);

  ctx.restore();
}

function renderGrid(step: number, color: string, dash?: [number, number]) {
  ctx.save();

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineCap = 'square';
  if (dash) ctx.setLineDash(dash);

  ctx.beginPath();
  for (let i = mod(transform.x, step); i < canvas.width; i += step) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let i = mod(transform.y, step); i < canvas.height; i += step) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
  }
  ctx.stroke();

  ctx.restore();
}

function render() {
  clean();

  const MAJOR_CELL_SIZE = 100 * transform.scale;
  const MINOR_CELL_SZIE = MAJOR_CELL_SIZE / 5;

  if (transform.scale > 0.5) {
    renderGrid(
      MINOR_CELL_SZIE,
      transform.scale > 0.7 ? Colors.DARK_GRAY2 : Colors.DARK_GRAY1,
      [3, 3],
    );
  }
  renderGrid(MAJOR_CELL_SIZE, Colors.DARK_GRAY4);
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

  render();
});
canvas.addEventListener(
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
