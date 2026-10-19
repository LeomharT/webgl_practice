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

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
}

resize();

const trasnform = {
  x: 0,
  y: 0,
  scale: 1,
};

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

const positions = Array.from({ length: 1500 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  length: MathUtils.randFloat(100, 300),
  angle: Math.random() * (Math.PI * 2),
  speed: MathUtils.randFloat(0.5, 2),
}));

const colors = [
  '#1D7324',
  '#3C8229',
  '#559132',
  '#6DA03F',
  '#85AF51',
  '#9CBD67',
  '#B3CC80',
  '#CADB9F',
  '#E0E9C1',
  '#F5F8E9',
  '#ECF7F6',
  '#C9E7E4',
  '#A8D6D5',
  '#8BC3C7',
  '#72B1BB',
  '#5B9DB1',
  '#4889A9',
  '#3975A2',
  '#2B609D',
  '#1F4B99',
];

function renderLine() {
  ctx.save();

  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const w = p.length / 2;

    const c = Math.cos(p.angle) * sizes.dpr;
    const s = Math.sin(p.angle) * sizes.dpr;

    const x = p.x + trasnform.x * sizes.dpr;
    const y = p.y + trasnform.y * sizes.dpr;

    ctx.setTransform(c, s, -s, c, x, y);

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = colors[i % colors.length];

    ctx.moveTo(-w, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();
  }

  ctx.restore();
}

let prevTime = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  positions.forEach((value) => (value.angle += dt * value.speed));

  clean();

  renderLine();

  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', resize);
const prev = { x: 0, y: 0 };
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
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  trasnform.x += e.clientX - prev.x;
  trasnform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

canvas.addEventListener(
  'wheel',
  (e) => {
    const next = MathUtils.clamp(
      trasnform.scale * Math.exp(-e.deltaY * 0.001),
      0.2,
      100,
    );

    const k = next / trasnform.scale;

    trasnform.x = e.clientX - (e.clientX - trasnform.x) * k;
    trasnform.y = e.clientY - (e.clientY - trasnform.y) * k;

    trasnform.scale = next;

    if (trasnform.scale === 0.2 || trasnform.scale === 100) return;
    positions.forEach((value) => {
      value.x = Math.random() * canvas.width * trasnform.scale;
      value.y = Math.random() * canvas.height * trasnform.scale;

      value.length = MathUtils.randFloat(100, 300) * trasnform.scale;
    });
  },
  { passive: false },
);
