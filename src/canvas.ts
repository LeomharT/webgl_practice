import { Colors } from '@blueprintjs/colors';


const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(value, min));
const mod = (n: number, m: number) => ((n % m) + m) % m;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.querySelector('#root')?.append(canvas);


const transform = {
  x: 0,
  y: 0,
  scale: 1
};

const MAJOR_CELL = 100;
const MINOR_CELL = MAJOR_CELL / 5;

const MOJOR_COLOR = Colors.DARK_GRAY3;
const MINOR_COLOR = Colors.DARK_GRAY2;

function clean() {
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function renderGrid(step: number, color: string, dash?: [number, number]) {
  ctx.save();

  step *= transform.scale;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);
  if (dash) ctx.setLineDash(dash);

  // Render y axes
  ctx.beginPath();
  if (dash) {
    ctx.lineDashOffset = -transform.y % (dash[0] + dash[1]);
  }
  for (let i = mod(transform.x, step); i < canvas.width; i += step) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
  }
  ctx.stroke();

  // Render x axes
  ctx.beginPath();
  if (dash) {
    ctx.lineDashOffset = -transform.x % (dash[0] + dash[1]);
  }
  for (let i = mod(transform.y, step); i < canvas.height; i += step) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
  }
  ctx.stroke();

  ctx.restore();
}

function render() {
  clean();

  renderGrid(MINOR_CELL, MINOR_COLOR, [3, 3]);
  renderGrid(MAJOR_CELL, MOJOR_COLOR);
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

canvas.addEventListener('pointerup', e => {
  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
});

canvas.addEventListener('pointermove', e => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  render();
});

window.addEventListener('wheel', e => {
  e.preventDefault();

  const next = clamp(
    transform.scale * Math.exp(-e.deltaY * 0.001), // Scale speed
    0.2,
    100
  );

  const k = next / transform.scale;

  transform.x = e.clientX - (e.clientX - transform.x) * k;
  transform.y = e.clientY - (e.clientY - transform.y) * k;

  transform.scale = next;

  render();
}, { passive: false });