import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';
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

const colors = [
  '#1F4B99',
  '#2B609D',
  '#3975A2',
  '#4889A9',
  '#5B9DB1',
  '#72B1BB',
  '#8BC3C7',
  '#A8D6D5',
  '#C9E7E4',
  '#ECF7F6',
  '#FFF3EC',
  '#FBDCC7',
  '#F5C6A5',
  '#EDB086',
  '#E29A69',
  '#D78450',
  '#CA6F3A',
  '#BC5927',
  '#AD4318',
  '#9E2B0E',
];

const pointer = {
  x: 0,
  y: 0,
};

const target = {
  x: 0,
  y: 0,
};

const positions = Array.from({ length: 500 }, () => ({
  x: Math.random() * sizes.width,
  y: Math.random() * sizes.height,
  color: colors[Math.floor(Math.random() * colors.length)],
  length: Math.random() * 200 + 50,
  angle: 0,
}));

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

function drawBleads() {
  for (const p of positions) {
    ctx.save();

    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.beginPath();
    ctx.moveTo(-p.length / 2, 0);
    ctx.lineTo(p.length / 2, 0);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = p.color;
    ctx.stroke();

    ctx.restore();
  }
}

let prevTime = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  const t = 1.0 - Math.exp(10.0 * -dt);

  target.x = MathUtils.lerp(target.x, pointer.x, t);
  target.y = MathUtils.lerp(target.y, pointer.y, t);

  for (const p of positions) {
    const theta = Math.atan2(target.y - p.y, target.x - p.x);
    p.angle = theta + Math.PI / 2;
  }

  clean();
  drawPointer(target.x, target.y);
  drawBleads();
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
