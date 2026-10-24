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
let mapReady = false;

const transform = {
  x: 0,
  y: 0,
  scale: 1,
};

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  if (mapReady)
    minScale = Math.min(
      sizes.width / offscreenCanvas.width,
      sizes.height / offscreenCanvas.height,
    );

  resizeMinimap();
  render();
}

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
  renderMinimapViewport();
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
  if (sizes.pixelRatio !== Math.min(2, window.devicePixelRatio)) resize();

  fpsGraph.begin();
  requestAnimationFrame(tick);
  fpsGraph.end();
}

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
  mapReady = true;
  renderMinimapImage();

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

// Minimap: cache the image separately from the moving viewport overlay.
const map = document.createElement('div');
map.style.width = 'min(300px, calc(100vw - 48px))';
map.style.height = 'min(200px, calc(100vh - 48px))';
map.style.background = Colors.NEUTRAL200;
map.style.position = 'absolute';
map.style.bottom = '24px';
map.style.right = '24px';
map.style.borderRadius = '20px';
map.style.opacity = '0.8';
map.style.overflow = 'hidden';
map.style.touchAction = 'none';
map.style.userSelect = 'none';
map.style.cursor = 'crosshair';
map.title = '点击定位，拖动视口移动地图';

const minimapCanvas = document.createElement('canvas');
minimapCanvas.style.width = '100%';
minimapCanvas.style.height = '100%';
minimapCanvas.style.display = 'block';
minimapCanvas.style.pointerEvents = 'none';
const minimapCtx = minimapCanvas.getContext('2d') as CanvasRenderingContext2D;

const minimapViewport = document.createElement('div');
minimapViewport.style.position = 'absolute';
minimapViewport.style.display = 'none';
minimapViewport.style.background = `${Colors.BLUE500}22`;
minimapViewport.style.boxShadow = `inset 0 0 0 2px ${Colors.BLUE500}`;
minimapViewport.style.cursor = 'grab';

map.append(minimapCanvas, minimapViewport);
el?.append(map);

const minimap = {
  width: 0,
  height: 0,
  pixelRatio: 0,
  x: 0,
  y: 0,
  scale: 1,
};

function resizeMinimap() {
  const width = map.clientWidth;
  const height = map.clientHeight;
  if (
    width === minimap.width &&
    height === minimap.height &&
    sizes.pixelRatio === minimap.pixelRatio
  )
    return;

  minimap.width = width;
  minimap.height = height;
  minimap.pixelRatio = sizes.pixelRatio;
  renderMinimapImage();
  renderMinimapViewport();
}

function renderMinimapImage() {
  if (!mapReady || minimap.width <= 0 || minimap.height <= 0) return;

  const { width, height } = offscreenCanvas;
  minimap.scale = Math.min(minimap.width / width, minimap.height / height);
  minimap.x = (minimap.width - width * minimap.scale) / 2;
  minimap.y = (minimap.height - height * minimap.scale) / 2;

  minimapCanvas.width = Math.round(minimap.width * minimap.pixelRatio);
  minimapCanvas.height = Math.round(minimap.height * minimap.pixelRatio);
  minimapCtx.setTransform(
    minimapCanvas.width / minimap.width,
    0,
    0,
    minimapCanvas.height / minimap.height,
    0,
    0,
  );
  minimapCtx.imageSmoothingEnabled = true;
  minimapCtx.imageSmoothingQuality = 'high';
  minimapCtx.drawImage(
    offscreenCanvas,
    minimap.x,
    minimap.y,
    width * minimap.scale,
    height * minimap.scale,
  );
}

function renderMinimapViewport() {
  if (!mapReady || minimap.width <= 0 || minimap.height <= 0) {
    minimapViewport.style.display = 'none';
    return;
  }

  const { x, y, scale } = transform;
  const { width, height } = offscreenCanvas;
  // Intersect the main viewport with the map in downsampled map coordinates.
  const left = clamp(-x / scale, 0, width);
  const top = clamp(-y / scale, 0, height);
  const right = clamp((sizes.width - x) / scale, 0, width);
  const bottom = clamp((sizes.height - y) / scale, 0, height);

  minimapViewport.style.display =
    right > left && bottom > top ? 'block' : 'none';
  minimapViewport.style.left = minimap.x + left * minimap.scale + 'px';
  minimapViewport.style.top = minimap.y + top * minimap.scale + 'px';
  minimapViewport.style.width = (right - left) * minimap.scale + 'px';
  minimapViewport.style.height = (bottom - top) * minimap.scale + 'px';
}

function minimapPoint(e: PointerEvent): Point {
  const rect = map.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - minimap.x) / minimap.scale,
    y: (e.clientY - rect.top - minimap.y) / minimap.scale,
  };
}

let minimapDrag: { pointerId: number; point: Point } | null = null;

map.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || !mapReady || minimapDrag) return;
  e.preventDefault();

  const point = minimapPoint(e);
  // Grabbing the viewport preserves the grab position; clicking elsewhere jumps.
  if (e.target !== minimapViewport) {
    const x = clamp(point.x, 0, offscreenCanvas.width);
    const y = clamp(point.y, 0, offscreenCanvas.height);
    transform.x = sizes.width / 2 - x * transform.scale;
    transform.y = sizes.height / 2 - y * transform.scale;
    requestRender();
  }

  minimapDrag = { pointerId: e.pointerId, point };
  map.setPointerCapture(e.pointerId);
  map.style.cursor = minimapViewport.style.cursor = 'grabbing';
});

map.addEventListener('pointermove', (e) => {
  if (minimapDrag?.pointerId !== e.pointerId) return;
  const point = minimapPoint(e);
  transform.x -= (point.x - minimapDrag.point.x) * transform.scale;
  transform.y -= (point.y - minimapDrag.point.y) * transform.scale;
  minimapDrag.point = point;
  requestRender();
});

function endMinimapPointer() {
  if (!minimapDrag) return;
  const { pointerId } = minimapDrag;
  minimapDrag = null;
  if (map.hasPointerCapture(pointerId)) map.releasePointerCapture(pointerId);
  map.style.cursor = 'crosshair';
  minimapViewport.style.cursor = 'grab';
}

for (const event of [
  'pointerup',
  'pointercancel',
  'lostpointercapture',
] as const)
  map.addEventListener(event, (e) => {
    if (minimapDrag?.pointerId === e.pointerId) endMinimapPointer();
  });
window.addEventListener('blur', endMinimapPointer);

new ResizeObserver(resizeMinimap).observe(map);

resize();
tick();
