import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { MathUtils } from 'three';
import { Pane } from 'tweakpane';
import { Colors } from './constants/color';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: 2,
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
  ctx.fillStyle = Colors.GRAY950;
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

    const c = Math.cos(p.angle) * sizes.pixelRatio;
    const s = Math.sin(p.angle) * sizes.pixelRatio;

    ctx.transform(c, s, -s, c, p.x * sizes.pixelRatio, p.y * sizes.pixelRatio);

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

function drawCursor(x: number, y: number) {
  ctx.save();

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, 0, 0);

  ctx.fillStyle = Colors.BLUE500;
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const pane = new Pane({ title: 'Debug pand' });

// Register plugin to the pane
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 3,
});

let velocityX = 0;
let translateX = 0;

let velocityY = 0;
let translateY = 0;

function render() {
  fpsGraph.begin();

  // Update
  velocityX += (transform.x - translateX) * 0.02; // Speed
  velocityX *= 0.9; // Damping

  translateX += velocityX;

  velocityY += (transform.y - translateY) * 0.02; // Speed
  velocityY *= 0.9; // Damping

  translateY += velocityY;

  positions.forEach((value) => {
    value.angle = Math.atan2(translateY - value.y, translateX - value.x);
    value.angle += Math.PI / 2;
  });

  // Clear canvas on each frame
  clean();

  drawLines();
  drawCursor(translateX, translateY);

  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

window.addEventListener('resize', resize);

canvas.addEventListener('pointermove', (e) => {
  transform.x = e.clientX;
  transform.y = e.clientY;
});
