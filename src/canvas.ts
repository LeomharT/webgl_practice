import { Colors } from '@blueprintjs/colors';

const COLORS = 'oklch(55.1% 0.027 264.364)';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const transform = { x: 0, y: 0 };

const canvas = document.createElement('canvas');
el?.append(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  clean();
  render();
}

resize();
function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function draw() {
  const CELL_SIZE = 100;
  const { width, height, pixelRatio } = sizes;

  ctx.save();
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  ctx.lineWidth = 2;
  ctx.strokeStyle = Colors.ROSE1;

  const offsetX = ((transform.x % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
  const offsetY = ((transform.y % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;

  ctx.beginPath();

  for (let y = offsetY; y <= height; y += CELL_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  for (let x = offsetX; x <= width; x += CELL_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function render() {
  clean();
  draw();
}
render();

const prev = { x: 0, y: 0 };
let isPending = false;

window.addEventListener('pointerdown', (e) => {
  isPending = true;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  const x = e.clientX - prev.x;
  const y = e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  transform.x += x;
  transform.y += y;

  render();
});

window.addEventListener('pointerup', () => {
  isPending = false;
});

window.addEventListener('resize', resize);
