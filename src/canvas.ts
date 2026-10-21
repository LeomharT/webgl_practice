import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';

const mod = (n: number, m: number) => ((n % m) + m) % m;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
el?.append(canvas);

const transform = {
  x: 0,
  y: 0,
  scale: 1,
};

const colors = Object.entries(Colors).map((value) => value[1]);

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
}
resize();

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

const positions = Array.from({ length: 500 }, (_, index) => ({
  x: Math.random() * sizes.width,
  y: Math.random() * sizes.height,
  color: colors[index % colors.length],
  length: MathUtils.randFloat(100, 300),
  angle: MathUtils.randFloat(0, Math.PI * 2),
  speed: MathUtils.randFloat(0.1, 1),
}));

function drawLines() {
  ctx.save();

  for (const p of positions) {
    ctx.save();

    const c = Math.cos(p.angle);
    const s = Math.sin(p.angle);

    ctx.transform(c, s, -s, c, p.x, p.y);

    ctx.strokeStyle = p.color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    const w = p.length / 2;

    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function render() {
  // Clear canvas on each frame
  clean();

  positions.forEach((value) => {
    value.angle += 0.1 * value.speed;
    value.angle = value.angle % (Math.PI * 2);
  });

  drawLines();

  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', resize);
