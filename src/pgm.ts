import { Colors } from '@blueprintjs/colors';
import './style.css';
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const MAP_ZOOM = 3;

const el = document.querySelector('#root') as HTMLDivElement;
el.style.background = Colors.BLACK;
el.style.width = '100vw';
el.style.height = '100vh';
el.style.display = 'flex';
el.style.justifyContent = 'center';
el.style.transform = 'scale(3, 3)';

const canvas = document.createElement('canvas');

canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
canvas.style.imageRendering = 'pixelated';
el?.append(canvas);

const svg = document.createElement('svg');
console.log(svg);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

type PGMData = {
  width: number;
  height: number;
  maxValue: number;
  data: Uint8Array;
};

type ObstacleLayer = 'lethal' | 'blocked' | 'path';

type ObstacleSnapshot = {
  msg: ObstacleData;
  cells?: Uint32Array;
  points?: [number, number][];
};

let mapCanvas: HTMLCanvasElement | null = null;
let mapSize: Pick<PGMData, 'width' | 'height'> | null = null;

const obstacleSnapshots: Partial<Record<ObstacleLayer, ObstacleSnapshot>> = {};

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(
    0,
    0,
    mapSize?.width ?? sizes.width,
    mapSize?.height ?? sizes.height,
  );

  ctx.restore();
}

function resizeMapCanvas(width: number, height: number) {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * MAP_ZOOM * dpr;
  canvas.height = height * MAP_ZOOM * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.imageRendering = 'pixelated';

  ctx.setTransform(MAP_ZOOM * dpr, 0, 0, MAP_ZOOM * dpr, 0, 0);
}

async function render() {
  const res = await fetch('/16f01.pgm');
  const arrayBuffer = await res.arrayBuffer();

  const pgm = parsePGM(arrayBuffer);

  if (!pgm) return;

  const { width, height, data } = pgm;
  resizeMapCanvas(width, height);

  mapSize = { width, height };
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

  mapCanvas = document.createElement('canvas');
  mapCanvas.width = width;
  mapCanvas.height = height;
  mapCanvas.getContext('2d')?.putImageData(imageData, 0, 0);

  redrawScene();
}

type ObstacleData = {
  count: number;
  data: string;
  encoding: string;
  frame_id: string;
  layer: string;
  origin: number[];
  region: { col0: number; row0: number; width: number; height: number };
  resolution: number;
  stamp: { sec: number; nanosec: number };
  points: [number, number][];
};

const TOPIC = {
  LETHAL: '/obstacles_lethal',
  BLOCKED: '/obstacles_blocked',
  PATH: '/obstacles_path',
} as const;

type ObstacleResponse = {
  op: 'publish' | 'public';
  topic: (typeof TOPIC)[keyof typeof TOPIC];
  msg: ObstacleData;
};

function receiveMessage() {
  const worker = new Worker(new URL('worker.js', import.meta.url));

  console.log('Connect open');
  worker.postMessage(JSON.stringify({ op: 'subscribe', topic: TOPIC.LETHAL }));
  worker.postMessage(JSON.stringify({ op: 'subscribe', topic: TOPIC.BLOCKED }));
  worker.postMessage(JSON.stringify({ op: 'subscribe', topic: TOPIC.PATH }));

  worker.onmessage = async (e: MessageEvent<ObstacleResponse>) => {
    const json = e.data;

    if (json.op !== 'publish' && json.op !== 'public') return;
    if (!json.msg) return;

    const layer = topicToLayer(json.topic);
    if (!layer) return;

    if (layer === 'path') {
      obstacleSnapshots[layer] = {
        msg: json.msg,
        points: json.msg.points,
      };

      console.log(obstacleSnapshots[layer]);
    } else {
      obstacleSnapshots[layer] = {
        msg: json.msg,
        cells: await decodeCells(json.msg),
      };
    }

    redrawScene();
  };
}

receiveMessage();

clean();
render();

function parsePGM(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset < view.byteLength) {
    const line = readLine(view, offset);
    offset += line.length + 1;

    console.log(line);

    const width = readNumber(view, offset);
    offset += width.length + 1;
    const height = readNumber(view, offset);
    offset += height.length + 1;
    const maxValue = readNumber(view, offset);
    offset += maxValue.length + 1;

    const data = new Uint8Array(view.buffer, offset);

    return {
      width: parseInt(width),
      height: parseInt(height),
      maxValue: parseInt(maxValue),
      data,
    } satisfies PGMData;
  }
}

const readLine = (view: DataView, offset: number) => {
  const chars = [];
  const flag = true;
  while (flag) {
    const char = view.getUint8(offset);
    if (char === 10 || char === 13) {
      break;
    }
    chars.push(String.fromCharCode(char));
    offset++;
  }
  return chars.join('');
};

const readNumber = (view: DataView, offset: number) => {
  const chars = [];
  const flag = true;
  while (flag) {
    const char = view.getUint8(offset);
    if (char === 32 || char === 10 || char === 13) {
      break;
    }
    chars.push(String.fromCharCode(char));
    offset++;
  }
  return chars.join('');
};

async function decodeCells(msg: ObstacleData) {
  if (msg.count === 0) return new Uint32Array(0); // 空帧：清层
  const bin = Uint8Array.from(atob(msg.data), (c) => c.charCodeAt(0));
  const raw = new Uint8Array(
    await new Response(
      new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer(),
  );
  const dv = new DataView(raw.buffer);
  const cells = new Uint32Array(msg.count);
  let acc = 0;
  for (let i = 0; i < msg.count; i++) {
    acc += dv.getUint32(i * 4, true); // true = 小端
    cells[i] = acc; // 前缀和还原绝对索引
  }
  return cells;
}

function redrawScene() {
  clean();

  if (!mapCanvas) return;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(mapCanvas, 0, 0);
  drawObstacleLayer(obstacleSnapshots.blocked, 'rgba(36, 212, 228, 0.25)');
  drawObstacleLayer(obstacleSnapshots.lethal, 'rgba(255, 48, 48, 0.9)');
  drawLocalPath(obstacleSnapshots.path, 'rgba(255, 220, 0, 0.95)');
}

function drawObstacleLayer(
  snapshot: ObstacleSnapshot | undefined,
  fillStyle: string,
) {
  if (!snapshot || !mapSize) return;
  if (!snapshot.cells) return;

  const { region } = snapshot.msg;

  ctx.save();
  ctx.fillStyle = fillStyle;

  for (const cell of snapshot.cells) {
    const localCol = cell % region.width;
    const localRow = Math.floor(cell / region.width);
    const x = region.col0 + localCol;
    const y = mapSize.height - 1 - (region.row0 + localRow);

    if (x < 0 || x >= mapSize.width || y < 0 || y >= mapSize.height) continue;

    ctx.fillRect(x, y, 1, 1);
  }

  ctx.restore();
}

function topicToLayer(topic: string): ObstacleLayer | null {
  if (topic === TOPIC.LETHAL) return 'lethal';
  if (topic === TOPIC.BLOCKED) return 'blocked';
  if (topic === TOPIC.PATH) return 'path';
  return null;
}
function worldToImage(
  x: number,
  y: number,
  meta: {
    origin: number[];
    resolution: number;
    mapHeight: number;
  },
) {
  const col = Math.floor((x - meta.origin[0]) / meta.resolution);
  const row = Math.floor((y - meta.origin[1]) / meta.resolution);

  return {
    x: col,
    y: meta.mapHeight - 1 - row,
  };
}
function drawLocalPath(
  snapshot: ObstacleSnapshot | undefined,
  fillStyle: string,
) {
  const points = snapshot?.points;

  if (!points || !points.length) return;

  ctx.save();
  ctx.strokeStyle = fillStyle;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = 0;

  ctx.beginPath();

  points.forEach(([wx, wy], index) => {
    if (!mapSize) return;
    const p = worldToImage(wx, wy, {
      origin: snapshot.msg.origin,
      resolution: snapshot.msg.resolution,
      mapHeight: mapSize.height,
    });

    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
  ctx.restore();
}
