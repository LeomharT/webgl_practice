import { Colors } from '@blueprintjs/colors';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.querySelector('#root')?.append(canvas);

const trasnform = {
  x: 0,
  y: 0,
  scale: 1,
};

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);

  ctx.restore();
}

const positions = Array.from({ length: 100 }, () => ({
  x: Math.random() * sizes.width,
  y: Math.random() * sizes.height,
}));

const colors = [
  '#1D7324',
  '#3C8229',
  '#559132',
  '#6DA03F',
  '#85AF51',
  '#9CBD67',
  '#B3CC80',
  '#CADB9F',
  '#E0E9C1',
  '#F5F8E9',
  '#ECF7F6',
  '#C9E7E4',
  '#A8D6D5',
  '#8BC3C7',
  '#72B1BB',
  '#5B9DB1',
  '#4889A9',
  '#3975A2',
  '#2B609D',
  '#1F4B99',
];

function render() {
  clean();
  requestAnimationFrame(render);
}
render();

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
}
resize();

window.addEventListener('resize', resize);
