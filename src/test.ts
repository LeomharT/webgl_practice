import { Colors } from '@blueprintjs/colors';
import './style.css';

const el = document.querySelector('#root');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.createElement('canvas');
canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const pointer = {
  x: 0,
  y: 0,
};

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);
  ctx.restore();
}

function drawPointer(x: number, y: number) {
  ctx.save();
  ctx.fillStyle = Colors.VIOLET3;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render() {
  clean();
  drawPointer(pointer.x, pointer.y);
  requestAnimationFrame(render);
}
render();

window.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width;
  canvas.height = sizes.height;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
});
