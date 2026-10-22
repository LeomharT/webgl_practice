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
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
el?.append(canvas);

let pgmMap:
  | {
      imageData: ImageData;
      width: number;
      height: number;
    }
  | undefined;

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
  ctx.fillStyle = Colors.SLATE800;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderImageData(pgm: typeof pgmMap) {
  if (!pgm) return;

  ctx.save();

  ctx.putImageData(pgm.imageData, -pgm.width / 2, -pgm.height / 2);

  ctx.restore();
}

function render() {
  clean();
  renderImageData(pgmMap);
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

canvas.addEventListener('pointermove', (e) => {
  transform.x = e.clientX;
  transform.y = e.clientY;
});

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
  const imageData = ctx.createImageData(width, height, {
    colorSpace: 'srgb',
  });

  for (let i = 0; i < data.length; i++) {
    const i4 = i * 4;
    imageData.data[i4 + 0] = data[i];
    imageData.data[i4 + 1] = data[i];
    imageData.data[i4 + 2] = data[i];
    imageData.data[i4 + 3] = 255;
  }

  pgmMap = {
    imageData,
    width,
    height,
  };

  render();
})();
