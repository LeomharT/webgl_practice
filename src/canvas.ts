const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = sizes.width * sizes.pixelRatio;
canvas.height = sizes.height * sizes.pixelRatio;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const camera = { x: 0, y: 0, scale: 1 };

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}
const COLOR = '#D3D3D3';
const CELL = 50;
const SUB = 5;
const DASH = [3, 3];

function drawGrid() {
  const dpr = sizes.pixelRatio;
  const { x: ox, y: oy, scale } = camera;

  const majorPx = CELL * scale;
  const minorPx = majorPx / SUB;

  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const dashLen = DASH[0] + DASH[1];
  // wDev 是线宽（设备像素）：奇数宽度对齐到像素中心，偶数宽度对齐到像素边界
  const snap = (v: number, wDev: number) =>
    wDev % 2 === 1
      ? (Math.floor(v * dpr) + 0.5) / dpr
      : Math.round(v * dpr) / dpr;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 屏幕空间绘制，线宽不随缩放变化

  // ---------- 1. 内部虚线（跳过与大格重合的线） ----------
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / dpr; // 1 个设备像素
  ctx.setLineDash(DASH);

  // 竖线
  if (scale > 1.0) {
    ctx.lineDashOffset = mod(-oy, dashLen); // 虚线相位跟随相机，平移时花纹不"流动"
    ctx.beginPath();
    for (let i = Math.floor(-ox / minorPx); ; i++) {
      const x = ox + i * minorPx; // 用整数下标计算，避免累加误差
      if (x > sizes.width) break;
      if (mod(i, SUB) === 0) continue; // 这条属于大格，由实线负责
      const sx = snap(x, 1);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, sizes.height);
    }
    ctx.stroke();

    // 横线
    ctx.lineDashOffset = mod(-ox, dashLen);
    ctx.beginPath();
    for (let j = Math.floor(-oy / minorPx); ; j++) {
      const y = oy + j * minorPx;
      if (y > sizes.height) break;
      if (mod(j, SUB) === 0) continue;
      const sy = snap(y, 1);
      ctx.moveTo(0, sy);
      ctx.lineTo(sizes.width, sy);
    }
    ctx.stroke();
  }

  // ---------- 2. 外层实线框（画在上面） ----------
  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1 / dpr; // 2 个设备像素，比虚线更醒目
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  ctx.beginPath();
  for (let i = Math.floor(-ox / majorPx); ; i++) {
    const x = ox + i * majorPx;
    if (x > sizes.width) break;
    const sx = snap(x, 2);
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, sizes.height);
  }
  for (let j = Math.floor(-oy / majorPx); ; j++) {
    const y = oy + j * majorPx;
    if (y > sizes.height) break;
    const sy = snap(y, 2);
    ctx.moveTo(0, sy);
    ctx.lineTo(sizes.width, sy);
  }
  ctx.stroke();

  ctx.restore();
}

function render() {
  clean();

  drawGrid();

  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.pixelRatio;
  canvas.height = sizes.height * sizes.pixelRatio;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
});
// 拖动平移
let dragging = false;
let last = { x: 0, y: 0 };
canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  last = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  camera.x += e.clientX - last.x;
  camera.y += e.clientY - last.y;
  last = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', () => (dragging = false));

// 滚轮以鼠标位置为中心缩放
canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const next = Math.min(
      100,
      Math.max(0.2, camera.scale * Math.exp(-e.deltaY * 0.001)),
    );
    const k = next / camera.scale;
    camera.x = e.clientX - (e.clientX - camera.x) * k;
    camera.y = e.clientY - (e.clientY - camera.y) * k;
    camera.scale = next;
  },
  { passive: false },
);
