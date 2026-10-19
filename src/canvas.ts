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

const action = {
  transform: 'translate',
  grid: false,
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.querySelector('#root')?.append(canvas);

function clean() {
  ctx.save();

  ctx.setTransform(sizes.dpr, 0, 0, sizes.dpr, 0, 0);
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);

  ctx.restore();
}

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  canvas.width = sizes.width * sizes.dpr;
  canvas.height = sizes.height * sizes.dpr;

  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';

  clean();
}
resize();

const pane = new Pane({ title: '🚧🚧🚧 Debug Pane 🚧🚧🚧' });
pane.addBinding(action, 'transform', {
  view: 'list',
  label: 'Transform',
  options: [
    { text: 'Translate', value: 'translate' },
    { text: 'Rotate', value: 'rotate' },
  ],
});
pane.addBinding(action, 'grid');

window.addEventListener('resize', resize);
