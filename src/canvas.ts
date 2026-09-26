import { Colors } from '@blueprintjs/colors';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const el = document.querySelector('#root');
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const MAJOR = 'oklch(92.8% 0.006 264.531)';

const prev = { x: 0, y: 0 };
const transform = { x: 0, y: 0, scale: 1 };

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function draw() {
  ctx.save();

  ctx.fillStyle = MAJOR;
  ctx.fillRect(
    transform.x,
    transform.y,
    50 * transform.scale,
    50 * transform.scale,
  );

  ctx.restore();
}

function render() {
  clean();
  draw();
}

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  render();
}
resize();

window.addEventListener('resize', resize);

let isPending = false;

window.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  isPending = true;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

window.addEventListener('pointerup', () => {
  isPending = false;
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  render();
});

window.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const next = Math.min(
      100,
      Math.max(0.2, transform.scale * Math.exp(-e.deltaY * 0.001)),
    );

    const k = next / transform.scale;
    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
  },
  { passive: false },
);
