import { Colors } from '@blueprintjs/colors';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const el = document.querySelector('#root');
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const MAJOR = 'oklch(70.4% 0.04 256.788)';

const prev = { x: 0, y: 0 };
const transform = { x: 0, y: 0, scale: 1 };

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function draw() {
  ctx.save();

  ctx.fillStyle = MAJOR;
  ctx.fillRect(transform.x, transform.y, 50, 50);

  ctx.restore();
}

function render() {
  clean();
  draw();
}

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

window.addEventListener('resize', resize);

let isPending = false;

window.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  isPending = true;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

window.addEventListener('pointerup', () => {
  isPending = false;
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  render();
});
