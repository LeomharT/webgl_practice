import { Colors } from '@blueprintjs/colors';
import { Color, MathUtils, Vector3 } from 'three';
import { Pane } from 'tweakpane';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const transform = {
  x: sizes.width / 2,
  y: sizes.height / 2,
  scale: 1,
  rotate: 0,
};

const defaultParams = {
  transform: 'translate',
  grid: false,
  color: Colors.BLUE3,
  size: 300,
};

const params: typeof defaultParams = localStorage.getItem('params')
  ? { ...defaultParams, ...JSON.parse(localStorage.getItem('params')!) }
  : defaultParams;

const color = new Color(params.color);
const targetColor = new Color();

const v1 = new Vector3();
const v2 = new Vector3();

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

  render();
}

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderRect() {
  ctx.save();

  const x = transform.x * sizes.dpr;
  const y = transform.y * sizes.dpr;

  const c = Math.cos(transform.rotate);
  const s = Math.sin(transform.rotate);

  ctx.setTransform(
    c * sizes.dpr,
    s * sizes.dpr,
    -s * sizes.dpr,
    c * sizes.dpr,
    x,
    y,
  );

  const w = params.size;
  ctx.fillStyle = params.color;

  ctx.fillRect(
    -(w / 2) * transform.scale,
    -(w / 2) * transform.scale,
    w * transform.scale,
    w * transform.scale,
  );

  ctx.restore();
}

function render() {
  clean();

  renderRect();
}

function updateParams() {
  if (colorAnimationId === null) {
    color.set(params.color);
  }
  render();
}

resize();

const pane = new Pane({ title: '🚧🚧🚧 Debug Pane 🚧🚧🚧' });
pane
  .addBinding(params, 'transform', {
    view: 'list',
    label: 'Transform',
    options: [
      { text: 'Translate', value: 'translate' },
      { text: 'Rotate', value: 'rotate' },
    ],
  })
  .on('change', updateParams);
pane.addBinding(params, 'grid').on('change', updateParams);
const p_color = pane.addBinding(params, 'color').on('change', updateParams);
pane.addBinding(params, 'size', { min: 0 }).on('change', updateParams);

const color_folder = pane.addFolder({ title: 'Colors' });
color_folder.addButton({ title: '🟥 Red' }).on('click', () => {
  setColor(Colors.RED3);
});
color_folder.addButton({ title: '🟩 Green' }).on('click', () => {
  setColor(Colors.GREEN3);
});
color_folder.addButton({ title: '🟦 Blue' }).on('click', () => {
  setColor(Colors.BLUE3);
});

let colorAnimationId: number | null = null;
let prevTime = 0;

function setColor(color: string) {
  targetColor.set(color);
  v2.setFromColor(targetColor);

  if (colorAnimationId === null) {
    prevTime = performance.now();
    colorAnimationId = requestAnimationFrame(lerpToColor);
  }
}

function lerpToColor(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  console.log(time, prevTime, dt);

  const t = 1.0 - Math.exp(-5.0 * dt);

  color.lerp(targetColor, t);
  v1.setFromColor(color);

  params.color = '#' + color.getHexString();

  const finished = v1.distanceToSquared(v2) < 0.00001;

  if (finished) {
    color.copy(targetColor);
    params.color = '#' + color.getHexString();
  }

  p_color.refresh();

  if (finished) {
    return (colorAnimationId = null);
  }

  colorAnimationId = requestAnimationFrame(lerpToColor);
}

pane
  .addButton({
    title: 'Reset',
  })
  .on('click', () => {
    localStorage.clear();
    window.location.reload();
  });

pane
  .addButton({
    title: 'Save',
  })
  .on('click', () => {
    localStorage.setItem('params', JSON.stringify(params));
  });

window.addEventListener('resize', resize);

const prev = { x: 0, y: 0, rotare: 0 };
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);

  prev.x = e.clientX;
  prev.y = e.clientY;

  prev.rotare = Math.atan2(e.clientY - transform.y, e.clientX - transform.x);
});
canvas.addEventListener('pointerup', (e) => {
  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }

  prev.rotare = 0;
  prev.x = 0;
  prev.y = 0;
});

canvas.addEventListener('pointermove', (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;

  if (params.transform === 'translate' || e.buttons === 2) {
    transform.x += e.clientX - prev.x;
    transform.y += e.clientY - prev.y;

    prev.x = e.clientX;
    prev.y = e.clientY;
  }

  if (params.transform === 'rotate') {
    const theta = Math.atan2(e.clientY - transform.y, e.clientX - transform.x);
    transform.rotate += theta - prev.rotare;
    prev.rotare = theta;
  }

  render();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const next = MathUtils.clamp(
      transform.scale * Math.exp(-e.deltaY * 0.001),
      0.2,
      100,
    );

    const k = next / transform.scale;

    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
  },
  { passive: false },
);
