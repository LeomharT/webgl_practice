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

function renderLabel() {
  ctx.save();

  ctx.font = 'lighter 12px default';
  ctx.textBaseline = 'middle';

  // Pixel length
  const x1 = startCoord;
  const x2 = endCoord;

  const length = Math.hypot(x2.x - x1.x, x2.y - x1.y);
  const lengthTxt = length.toFixed(2) + 'px';

  const textMet = ctx.measureText(lengthTxt);

  const center = {
    x: (x2.x - x1.x) / 2 + x1.x,
    y: (x2.y - x1.y) / 2 + x1.y,
  };

  let theta = Math.atan2(x2.y - x1.y, x2.x - x1.x);
  const offset = 20;

  if (theta >= Math.PI / 2) {
    theta -= Math.PI;
  } else if (theta < -Math.PI / 2) {
    theta += Math.PI;
  }

  const c = Math.cos(theta);
  const s = Math.sin(theta);

  ctx.setTransform(
    c * sizes.pixelRatio,
    s * sizes.pixelRatio,
    -s * sizes.pixelRatio,
    c * sizes.pixelRatio,
    center.x * sizes.pixelRatio,
    center.y * sizes.pixelRatio,
  );

  const rect = {
    width: textMet.width + 10,
    height: 20,
  };
  ctx.fillStyle = Colors.BLUE3;
  ctx.beginPath();
  ctx.roundRect(-rect.width / 2, -10 + offset, rect.width, rect.height, 5);
  ctx.fill();

  ctx.fillStyle = Colors.WHITE;
  ctx.fillText(lengthTxt, -textMet.width / 2, offset);

  ctx.restore();
}

function render() {
  clean();

  if (startCoord.x === 0 && endCoord.x === 0) return;
  if (startCoord.y === 0 && endCoord.y === 0) return;

  renderLine();
  renderLabel();
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
});
