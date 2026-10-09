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

const MOJOR_COLOR = Colors.DARK_GRAY3;

function clean() {
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function renderGrid(step: number) {
  ctx.save();

  step *= transform.scale;

  ctx.strokeStyle = MOJOR_COLOR;
  ctx.lineWidth = 1;

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);

  // Render y axes
  ctx.beginPath();
  for (let i = mod(transform.x, step); i < canvas.width; i += step) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
  }
  ctx.stroke();

  // Render x axes
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

  renderGrid(MAJOR_CELL);
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

let isPending = false;
const prev = {
  x: 0,
  y: 0
};

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