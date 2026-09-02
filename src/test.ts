import { Colors } from '@blueprintjs/colors';
import './style.css';
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
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

  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);

  ctx.restore();
}

async function render() {
  const res = await fetch('/16F0826.pgm');
  const arrayBuffer = await res.arrayBuffer();

  const pgm = parsePGM(arrayBuffer);

  if (!pgm) return;

  const { width, height, data } = pgm;

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

  ctx.putImageData(imageData, 0, 0);
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
};

const TOPIC = {
  LETHAL: '/obstacles_lethal',
  BLOCKED: '/obstacles_blocked',
};

type ObstacleResponse = {
  op: 'public';
  topic: (typeof TOPIC)[keyof typeof TOPIC];
  msg: ObstacleData;
};

function connectWS() {
  const ws = new WebSocket('ws://localhost:8080/api/v1/ws');

  ws.onopen = () => {
    console.log('Connect open');
    ws.send(JSON.stringify({ Hello: 'world!!' }));
  };

  ws.onmessage = async (e) => {
    const json = JSON.parse(e.data) as ObstacleResponse;

    if (json.topic === TOPIC.LETHAL) {
      const message = json.msg;

      const data = await decodeCells(message);
    }
  };
}

connectWS();

clean();
render();

function parsePGM(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset < view.byteLength) {
    const line = readLine(view, offset);
    offset += line.length + 1;

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
    };
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
  let flag = true;
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
