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
canvas.style.touchAction = 'none';
canvas.style.userSelect = 'none';
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

let minScale = 0.1;

void (async function () {
  const res = await fetch('/park081302.pgm');

  const pgmData = parsePGM(await res.arrayBuffer());
  if (!pgmData) return;

  const { width, height, data } = downsampleMin(
    pgmData.data,
    pgmData.width,
    pgmData.height,
    4,
  );

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

  minScale = Math.min(sizes.width / width, sizes.height / height);
  transform.scale = minScale;

  transform.x = (sizes.width - width * transform.scale) / 2;
  transform.y = (sizes.height - height * transform.scale) / 2;

  render();
})();

type Point = { x: number; y: number };

const pointers = new Map<number, Point>();
let renderPending = false;

function requestRender() {
  if (renderPending) return;

  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    render();
  });
}

function canvasPoint(e: MouseEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function gesture() {
  const [a, b] = pointers.values();
  if (!a) return;
  return {
    center: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
    distance: b ? Math.hypot(b.x - a.x, b.y - a.y) : 0,
  };
}

// Keep the world point under the old center anchored to the new center.
function moveView(from: Point, to: Point, scale: number) {
  const next = clamp(scale, Math.min(minScale, 0.1), 100);

  const k = next / transform.scale;

  transform.x = to.x - (from.x - transform.x) * k;
  transform.y = to.y - (from.y - transform.y) * k;

  transform.scale = next;

  requestRender();
}

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;

  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, canvasPoint(e));
});

function endPointer(e: PointerEvent) {
  pointers.delete(e.pointerId);

  if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId);
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('lostpointercapture', endPointer);

window.addEventListener('blur', () => {
  for (const pointerId of pointers.keys()) {
    if (canvas.hasPointerCapture(pointerId))
      canvas.releasePointerCapture(pointerId);
  }
  pointers.clear();
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  const before = gesture()!;
  pointers.set(e.pointerId, canvasPoint(e));
  const after = gesture()!;
  const ratio =
    before.distance > 0 && after.distance > 0
      ? after.distance / before.distance
      : 1;
  moveView(before.center, after.center, transform.scale * ratio);
});

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();

    const point = canvasPoint(e);
    moveView(point, point, transform.scale * Math.exp(-e.deltaY * 0.001));
  },
  { passive: false },
);

function downsampleMin(src: Uint8Array, w: number, h: number, f = 4) {
  const dw = Math.ceil(w / f);
  const dh = Math.ceil(h / f);
  const dst = new Uint8Array(dw * dh);

  for (let dy = 0; dy < dh; dy++) {
    const y0 = dy * f;
    const y1 = Math.min(y0 + f, h); // 最后一行块可能不满 4 行
    for (let dx = 0; dx < dw; dx++) {
      const x0 = dx * f;
      const x1 = Math.min(x0 + f, w); // 最后一列块可能不满 4 列
      let m = 255;
      for (let y = y0; y < y1; y++) {
        const row = y * w;
        for (let x = x0; x < x1; x++) {
          const v = src[row + x];
          if (v < m) m = v;
        }
      }
      dst[dy * dw + dx] = m;
    }
  }
  return { data: dst, width: dw, height: dh };
}

// Mimimap
const map = document.createElement('div');
map.style.width = '300px';
map.style.height = '200px';
map.style.background = Colors.NEUTRAL200;
map.style.position = 'absolute';
map.style.bottom = '24px';
map.style.right = '24px';
map.style.borderRadius = '20px';
map.style.opacity = '0.8';

el?.append(map);
