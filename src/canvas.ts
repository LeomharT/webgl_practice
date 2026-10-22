import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { Colors } from './constants/color';

const mod = (n: number, m: number) => ((n % m) + m) % m;
const snap = (v: number) => Math.round(v * sizes.pixelRatio) / sizes.pixelRatio;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(v, min));

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.style.imageRendering = 'pixelated';
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
el?.append(canvas);

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext(
  '2d',
) as CanvasRenderingContext2D;

const transform = {
  x: 0,
  y: 0,
  scale: 1,
};

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
  ctx.fillStyle = Colors.GRAY100;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderImageData() {
  ctx.save();

  const tx = transform.x * sizes.pixelRatio;
  const ty = transform.y * sizes.pixelRatio;

  const s = sizes.pixelRatio * transform.scale;

  ctx.setTransform(s, 0, 0, s, tx, ty);
  ctx.imageSmoothingEnabled = s < 1;
  ctx.drawImage(offscreenCanvas, 0, 0);

  ctx.restore();
}

function renderGrad(step: number, color: string, dash?: [number, number]) {
  ctx.save();

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, 0, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 / sizes.pixelRatio;

  const xsnap = snap(transform.x);
  const ysnap = snap(transform.y);

  if (dash) ctx.setLineDash(dash);

  ctx.beginPath();
  if (dash) ctx.lineDashOffset = -ysnap % (dash[0] + dash[1]);
  for (let x = mod(xsnap, step); x < sizes.width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, sizes.height);
  }
  ctx.stroke();

  ctx.beginPath();
  if (dash) ctx.lineDashOffset = -xsnap % (dash[0] + dash[1]);
  for (let y = mod(ysnap, step); y < sizes.height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(sizes.width, y);
  }
  ctx.stroke();

  ctx.restore();
}

function render() {
  clean();

  const MAJOR_CELL = 100 * transform.scale;
  const MINOR_CELL = MAJOR_CELL / 5;

  if (transform.scale > 0.5)
    renderGrad(
      MINOR_CELL,
      transform.scale > 0.7 ? Colors.GRAY300 : Colors.GRAY200,
      [3, 3],
    );
  renderGrad(
    MAJOR_CELL,
    transform.scale > 0.5 ? Colors.GRAY300 : Colors.GRAY200,
  );

  renderImageData();
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

function tick() {
  fpsGraph.begin();
  requestAnimationFrame(tick);
  fpsGraph.end();
}
tick();

window.addEventListener('resize', resize);

// Utils
function read(view: DataView, offset: number, isNumber: boolean = false) {
  const charts = [];
  const flag = true;

  while (flag) {
    const chart = view.getUint8(offset);

    if (isNumber && chart === 32) break;
    if (chart === 10 || chart === 13) break;

    charts.push(String.fromCharCode(chart));
    offset++;
  }

  return charts.join('');
}

function parsePGM(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset < view.byteLength) {
    const line = read(view, offset);
    offset += line.length + 1;

    const width = read(view, offset, true);
    offset += width.length + 1;
    const height = read(view, offset, true);
    offset += height.length + 1;
    const maxValue = read(view, offset, true);
    offset += maxValue.length + 1;

    const data = new Uint8Array(view.buffer, offset);

    return {
      width: parseInt(width),
      height: parseInt(height),
      maxValue: parseInt(maxValue),
      data,
    };
  }
}

void (async function () {
  const res = await fetch('/park081302.pgm');

  const pgmData = parsePGM(await res.arrayBuffer());
  if (!pgmData) return;

  const { width, height, data } = pgmData;
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  const imageData = offscreenCtx.createImageData(width, height, {
    colorSpace: 'srgb',
  });

  for (let i = 0; i < data.length; i++) {
    const pixel = data[i];
    let alpha = 255;

    // Unknow area
    if (pixel === 205) alpha = 0;

    const i4 = i * 4;
    imageData.data[i4 + 0] = pixel;
    imageData.data[i4 + 1] = pixel;
    imageData.data[i4 + 2] = pixel;
    imageData.data[i4 + 3] = alpha;
  }

  offscreenCtx.putImageData(imageData, 0, 0);
  transform.x = sizes.width / 2 - width / 2;
  transform.y = sizes.height / 2 - height / 2;

  render();
})();

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

  transform.x += e.clientX - prev.x;
  transform.y += e.clientY - prev.y;

  prev.x = e.clientX;
  prev.y = e.clientY;

  render();
});

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const next = clamp(transform.scale * Math.exp(-e.deltaY * 0.001), 0.1, 100);

    const k = next / transform.scale;

    transform.x = e.clientX - (e.clientX - transform.x) * k;
    transform.y = e.clientY - (e.clientY - transform.y) * k;

    transform.scale = next;

    render();
  },
  { passive: false },
);
