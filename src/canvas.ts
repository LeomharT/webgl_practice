import { Colors } from '@blueprintjs/colors';
import CameraControls from 'camera-controls';
import { MathUtils } from 'three';
import { Pane } from 'tweakpane';
CameraControls.install({ THREE: await import('three') });

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(value, min));

const mod = (n: number, m: number) => ((n % m) + m) % m;
const prev = { x: 0, y: 0 };

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};
const el = document.querySelector('#root') as HTMLDivElement;

const canvas = document.createElement('canvas');

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
}
resize();
el.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderCursor(x: number, y: number) {
  ctx.save();

  ctx.fillStyle = Colors.ROSE1;

  ctx.beginPath();
  ctx.arc(x, y, 50, 0, Math.PI * 2);
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

const positions = Array.from({ length: 100 }).map(() => ({
  x: sizes.width * Math.random(),
  y: sizes.height * Math.random(),
  length: MathUtils.randFloat(100, 200),
  angle: Math.random() * (Math.PI * 2),
  speed: MathUtils.randFloat(0.1, 5),
}));

function renderLine() {
  ctx.save();

  ctx.lineWidth = 5;

  for (let i = 0; i < positions.length; i++) {
    ctx.save();

    ctx.beginPath();
    const p = positions[i];
    const c = colors[i % colors.length];

    ctx.transform(1, 0, 0, 1, p.x, p.y);
    ctx.rotate(p.angle);

    ctx.strokeStyle = c;

    const l = p.length / 2;

    ctx.moveTo(-l, 0);
    ctx.lineTo(l, 0);

    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

let prevTime = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  positions.forEach((value) => {
    value.angle += dt * value.speed;
    value.angle %= Math.PI * 2;
  });

  clean();

  renderLine();
  renderCursor(prev.x, prev.y);

  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', resize);

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  prev.x = e.clientX;
  prev.y = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  prev.x = e.clientX;
  prev.y = e.clientY;
});

const pane = new Pane({ title: '🚧🚧🚧DEBUG🚧🚧🚧' });
