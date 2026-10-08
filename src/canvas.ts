import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';

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
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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

let isPending = false;
let prevTime = 0;

const p = {
  x: 0,
  y: 0
};

let accelerationX = 0;
let translateX = 0;

let accelerationY = 0;
let translateY = 0;



function render(time: number = 0) {
  // Update
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  const t = 1.0 - Math.exp(-5.0 * dt);

  if (isPending) {
    p.x = MathUtils.lerp(p.x, POINT.x, t);
    translateX = p.x;

    p.y = MathUtils.lerp(p.y, POINT.y, t);
    translateY = p.y;

    clean();
    drawCursor(translateX, translateY);
  } else {
    accelerationX += (sizes.width / 2 - translateX) * 0.02;
    accelerationX *= 0.9;

    translateX += accelerationX;
    p.x = translateX;

    accelerationY += (sizes.height / 2 - translateY) * 0.02;
    accelerationY *= 0.9;

    translateY += accelerationY;
    p.y = translateY;

    clean();
    drawCursor(translateX, translateY);
  }

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

  POINT.x = sizes.width / 2;
  POINT.y = sizes.height / 2;
}
resize();

window.addEventListener('resize', resize);

window.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  isPending = true;

  POINT.x = e.clientX;
  POINT.y = e.clientY;
});
window.addEventListener('pointerup', (e) => {
  canvas.releasePointerCapture(e.pointerId);
  isPending = false;
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  POINT.x = e.clientX;
  POINT.y = e.clientY;
});
