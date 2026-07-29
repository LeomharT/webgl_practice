import './style.css';

type Vector2 = {
  x: number;
  y: number;
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clean() {
  ctx.save();
  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, sizes.width, sizes.height);
  ctx.restore();
}

clean();

function point(v: Vector2) {
  ctx.save();
  const s = 30;
  ctx.fillStyle = '#7961DB';
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);
  ctx.restore();
}

function screen(v: Vector2) {
  const x = (v.x + 1.0) / 2.0;
  const y = -(v.y - 1.0) / 2.0;

  return { x: x * sizes.width, y: y * sizes.height };
}

const _vs = [
  { x: 0.25, y: 0.25, z: 0 },
  { x: -0.25, y: 0.25, z: 0 },
  { x: -0.25, y: -0.25, z: 0 },
  { x: 0.25, y: -0.25, z: 0 },
];

function render() {
  for (const v of _vs) {
    point(screen({ ...v }));
  }

  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width;
  canvas.height = sizes.height;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  clean();
});
