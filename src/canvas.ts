import { Colors } from '@blueprintjs/colors';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const root = document.querySelector('#root');

const canvas = document.createElement('canvas');
root?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  requestRender();
}

const startCoord = {
  x: 0,
  y: 0,
};
const endCoord = {
  x: 0,
  y: 0,
};

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderLine() {
  ctx.save();

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, 0, 0);

  ctx.lineWidth = 2;
  ctx.strokeStyle = Colors.BLUE3;
  ctx.fillStyle = Colors.WHITE;
  ctx.setLineDash([9, 3]);

  ctx.beginPath();
  ctx.moveTo(startCoord.x, startCoord.y);
  ctx.lineTo(endCoord.x, endCoord.y);

  ctx.stroke();

  // Render begin rect
  ctx.setLineDash([0, 0]);
  ctx.fillRect(startCoord.x - 5, startCoord.y - 5, 10, 10);
  ctx.strokeRect(startCoord.x - 5, startCoord.y - 5, 10, 10);

  // Render end rect
  ctx.fillRect(endCoord.x - 5, endCoord.y - 5, 10, 10);
  ctx.strokeRect(endCoord.x - 5, endCoord.y - 5, 10, 10);

  ctx.restore();
}

function render() {
  clean();

  renderLine();
}

let frameId: number | null = null;
function requestRender() {
  if (frameId) return;
  frameId = requestAnimationFrame(() => {
    frameId = null;
    render();
  });
}

resize();
window.addEventListener('resize', resize);

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  startCoord.x = e.clientX;
  startCoord.y = e.clientY;
});

canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  endCoord.x = e.clientX;
  endCoord.y = e.clientY;

  requestRender();

  // Pixel length
  const x1 = startCoord;
  const x2 = endCoord;

  const length = Math.hypot(x2.x - x1.x, x2.y - x1.y);

  console.log(length);
});
