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

const prev = { x: 0, y: 0 };

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function render() {
  clean();
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
