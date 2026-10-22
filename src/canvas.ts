import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Pane } from 'tweakpane';
import { Colors } from './constants/color';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: 2,
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
  ctx.fillStyle = Colors.SLATE950;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderImageData() {
  ctx.save();

  const tx = transform.x * sizes.pixelRatio;
  const ty = transform.y * sizes.pixelRatio;

  ctx.setTransform(sizes.pixelRatio, 0, 0, sizes.pixelRatio, tx, ty);
  ctx.drawImage(offscreenCanvas, 0, 0);

  ctx.restore();
}

function render() {
  clean();
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
  const res = await fetch('/16f01.pgm');

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

    const color = { r: 0, g: 0, b: 0 };

    // Unknow area
    if (pixel === 205) alpha = 0;
    // Blocked area
    if (pixel === 0) {
      color.r = 229;
      color.g = 231;
      color.b = 235;
    }
    //
    if (pixel === 254 || pixel === 255) {
      color.r = 30;
      color.g = 41;
      color.b = 59;
    }

    const i4 = i * 4;
    imageData.data[i4 + 0] = color.r;
    imageData.data[i4 + 1] = color.g;
    imageData.data[i4 + 2] = color.b;
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
