import { Colors } from '@blueprintjs/colors';
import type { Vector2Like } from 'three';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.widows = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clear() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);
  ctx.restore();
}

function point(v: Vector2Like) {
  ctx.save();

  const s = 30;
  ctx.fillStyle = Colors.VIOLET4;
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);

  ctx.restore();
}

function renderCircle(dt: number) {
  dt *= 0.001;

  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;

    const x = Math.cos(angle + dt) * 400 + sizes.width / 2;
    const y = Math.sin(angle + dt) * 400 + sizes.height / 2;

    point({ x, y });
  }
}

let prev = 0;

function render(time: number = 0) {
  const dt = time - prev;
  prev = time;

  clear();
  renderCircle(prev);

  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width;
  canvas.height = sizes.height;
  canvas.style.widows = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
});
