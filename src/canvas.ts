const COLORS = 'oklch(55.1% 0.027 264.364)';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const transform = { x: 0, y: 0, scale: 1 };

const canvas = document.createElement('canvas');
el?.append(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

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
function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function draw() {
  const MAJOR = 100 * transform.scale;
  const MINOR = MAJOR / 5;

  const MAJOR_COLOR = 'oklch(55.1% 0.027 264.364 / 0.4)';
  const MINOR_COLOR = 'oklch(55.1% 0.027 264.364 / 0.2)';

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  function strokeGrid(
    step: number,
    color: string,
    lineWidth: number,
    dash?: boolean,
  ) {
    ctx.save();

    const { width, height } = sizes;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (dash) ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.lineDashOffset = mod(-transform.y, 3 + 3);
    for (let x = mod(transform.x, step); x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.lineDashOffset = mod(-transform.x, 3 + 3);
    for (let y = mod(transform.y, step); y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  const { pixelRatio } = sizes;

  ctx.save();
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  strokeGrid(MINOR, MINOR_COLOR, 1, true); // 先画细线
  strokeGrid(MAJOR, MAJOR_COLOR, 1); // 再画粗线，盖在上面

  ctx.restore();
}

function render() {
  clean();
  draw();
}
render();

const prev = { x: 0, y: 0 };
let isPending = false;

window.addEventListener('pointerdown', (e) => {
  isPending = true;

  prev.x = e.clientX;
  prev.y = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isPending) return;

  const x = e.clientX - prev.x;
  const y = e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  transform.x += x;
  transform.y += y;

  render();
});

window.addEventListener('pointerup', () => {
  isPending = false;
});

window.addEventListener('resize', resize);

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
