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
  x: sizes.width / 2,
  y: sizes.height / 2,
};

const point = {
  x: sizes.width / 2,
  y: sizes.height / 2,
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

const positions = Array.from({ length: 500 }, (_, i) => ({
  x: Math.random() * sizes.width,
  y: Math.random() * sizes.height,
  color: colors[i % colors.length],
  length: MathUtils.randFloat(100, 300),
  angle: 0,
}));

function renderLineSegment() {
  ctx.save();

  for (const p of positions) {
    ctx.save();

    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.beginPath();
    ctx.moveTo(-p.length / 2, 0);
    ctx.lineTo(p.length / 2, 0);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

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

  for (const p of positions) {
    const theta = Math.atan2(cursor.y - p.y, cursor.x - p.x);
    p.angle = theta + Math.PI / 2;
  }

  renderLineSegment();
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

  for (const p of positions) {
    p.x = Math.random() * sizes.width;
    p.y = Math.random() * sizes.height;
  }
});
