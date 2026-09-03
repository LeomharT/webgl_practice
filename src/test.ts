import { Colors } from '@blueprintjs/colors';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, devicePixelRatio),
};

const el = document.querySelector('#root') as HTMLDivElement;
el.style.display = 'flex';
el.style.justifyContent = 'center';
el.style.alignItems = 'center';
el.style.height = '100vh';
el.style.background = Colors.BLACK;

const canvas = document.createElement('canvas');
canvas.width = size.width * size.pixelRatio;
canvas.height = size.height * size.pixelRatio;
canvas.style.width = size.width + 'px';
canvas.style.height = size.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
ctx.scale(size.pixelRatio, size.pixelRatio);

const origin = {
  x: size.width / 2,
  y: size.height / 2,
};

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.restore();
}

function renderOrigin() {
  {
    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = Colors.CERULEAN3;
    ctx.translate(origin.x, origin.y);
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  {
    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = 'rgb(20, 126, 179, 0.3)';
    ctx.strokeStyle = Colors.CERULEAN3;

    ctx.translate(origin.x, origin.y);
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.stroke();

    ctx.restore();
  }
}

function renderRange() {
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(20, 126, 179, 0.1)';
  ctx.strokeStyle = Colors.CERULEAN3;

  ctx.translate(origin.x, origin.y);
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.lineDashOffset = offset * -10;
  ctx.setLineDash([5, 3]);
  ctx.stroke();

  ctx.restore();
}

function renderDirection(angle: number) {
  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(50, 0);
  ctx.lineWidth = 2;
  ctx.strokeStyle = Colors.CERULEAN3;
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  ctx.save();

  const p = new Path2D(
    'M6.3771 12.4679L3.94323 18.0159C3.24249 19.6132 4.95015 21.1979 6.49094 20.3797L19.7145 13.3532C21.0163 12.661 21.017 10.7949 19.7145 10.1034L6.49165 3.07755C4.95157 2.25872 3.24249 3.84476 3.94394 5.44141L6.3778 10.9894C6.47995 11.2223 6.5327 11.4739 6.5327 11.7283C6.5327 11.9827 6.47995 12.2343 6.3778 12.4672',
  );

  ctx.translate(origin.x, origin.y);
  ctx.rotate(angle);
  ctx.translate(-12 + 56, -12);

  ctx.fillStyle = Colors.CERULEAN3;
  ctx.fill(p);

  ctx.restore();
}

let prevTime = 0;
let dt = 0;
let offset = 0;
let angle = 0;
let isEnable = false;

function render(time: number = 0) {
  dt = (time - prevTime) / 1000;
  prevTime = time;

  offset += dt;

  clean();

  renderOrigin();
  renderRange();
  renderDirection(angle);
  // ANIMATION
  requestAnimationFrame(render);
}
render();

canvas.addEventListener('pointermove', (e) => {
  // origin.x = e.offsetX;
  // origin.y = e.offsetY;
  if (!isEnable) return;

  angle = Math.atan2(e.offsetY - origin.y, e.offsetX - origin.x);
});

canvas.addEventListener('pointerdown', () => {
  isEnable = !isEnable;
});
canvas.addEventListener('pointerup', () => {
  isEnable = !isEnable;
});
