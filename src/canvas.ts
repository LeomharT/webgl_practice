import { Colors } from '@blueprintjs/colors';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.querySelector('#root')?.append(canvas);

const POINT = {
  x: 0,
  y: 0,
};

function clean() {
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.width);
  ctx.restore();
}

function drawCursor(x: number, y: number) {
  ctx.save();

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);

  ctx.fillStyle = Colors.ROSE3;
  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

let accelerationY = 0;
let translateY = 0;

function render() {
  // Update

  accelerationY += (POINT.y - translateY) * 0.02; // Update Speed
  accelerationY *= 0.9; // Bounce strength
  translateY += accelerationY;

  clean();
  drawCursor(POINT.x, translateY);

  requestAnimationFrame(render);
}

render();

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
}
resize();

window.addEventListener('resize', resize);

window.addEventListener('pointermove', (e) => {
  POINT.x = e.clientX;
  POINT.y = e.clientY;
});
