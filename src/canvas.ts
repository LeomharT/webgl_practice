import { Colors } from '@blueprintjs/colors';
import { Pane } from 'tweakpane';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(2, window.devicePixelRatio),
};

const transform = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

const defaultParams = {
  transform: 'translate',
  grid: false,
  color: Colors.BLUE5,
  size: 300,
};

const params: typeof defaultParams = localStorage.getItem('params')
  ? { ...defaultParams, ...JSON.parse(localStorage.getItem('params')!) }
  : defaultParams;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.querySelector('#root')?.append(canvas);

function clean() {
  ctx.save();

  ctx.resetTransform();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
}

function renderRect() {
  ctx.save();

  const boxWidth = params.size;
  ctx.fillStyle = params.color;

  ctx.fillRect(transform.x, transform.y, boxWidth, boxWidth);

  ctx.restore();
}

function render() {
  clean();

  renderRect();
}

function updateParams() {
  localStorage.setItem('params', JSON.stringify(params));
  render();
}

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

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
pane.addBinding(params, 'color').on('change', updateParams);
pane.addBinding(params, 'size', { min: 0 }).on('change', updateParams);

pane
  .addButton({
    title: 'Reset',
  })
  .on('click', () => {
    localStorage.clear();
    window.location.reload();
  });

window.addEventListener('resize', resize);
