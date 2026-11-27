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

const prevCoord = {
  x: 0,
  y: 0,
};
const currCoord = {
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
  ctx.moveTo(prevCoord.x, prevCoord.y);
  ctx.lineTo(currCoord.x, currCoord.y);

  ctx.stroke();

  // Render begin rect
  ctx.setLineDash([0, 0]);
  ctx.fillRect(prevCoord.x - 5, prevCoord.y - 5, 10, 10);
  ctx.strokeRect(prevCoord.x - 5, prevCoord.y - 5, 10, 10);

  // Render end rect
  ctx.fillRect(currCoord.x - 5, currCoord.y - 5, 10, 10);
  ctx.strokeRect(currCoord.x - 5, currCoord.y - 5, 10, 10);

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

  prevCoord.x = e.clientX;
  prevCoord.y = e.clientY;
});

canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  currCoord.x = e.clientX;
  currCoord.y = e.clientY;

  requestRender();
});
