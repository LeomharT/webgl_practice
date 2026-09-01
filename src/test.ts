import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';
import './style.css';
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const cursor = {
  x: 0,
  y: 0,
};

const point = {
  x: 0,
  y: 0,
};

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);

  ctx.restore();
}

function renderCursor(x: number, y: number) {
  ctx.save();

  ctx.fillStyle = Colors.GOLD4;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

let prevTime = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  const t = 1.0 - Math.exp(5.0 * -dt);

  clean();

  cursor.x = MathUtils.lerp(cursor.x, point.x, t);
  cursor.y = MathUtils.lerp(cursor.y, point.y, t);

  renderCursor(cursor.x, cursor.y);

  requestAnimationFrame(render);
}
render();

window.addEventListener('pointermove', (e) => {
  point.x = e.clientX;
  point.y = e.clientY;
});

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width;
  canvas.height = sizes.height;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
});
