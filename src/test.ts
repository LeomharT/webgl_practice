import { Colors } from '@blueprintjs/colors';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const el = document.querySelector('#root') as HTMLDivElement;
el.style.width = window.innerWidth + 'px';
el.style.height = window.innerHeight + 'px';
el.style.background = Colors.BLACK;
el.style.position = 'relative';

const placeholder = document.createElement('div');
placeholder.style.visibility = 'hidden';
placeholder.style.position = 'absolute';
placeholder.style.background = Colors.BLUE1;
placeholder.style.border = '1px solid';
placeholder.style.borderColor = Colors.BLUE5;
el.append(placeholder);

const rects: Record<string, HTMLDivElement> = {};

let isEnable = false;
const start = { x: 0, y: 0 };

function handleOnPointMove(e: PointerEvent) {
  if (!isEnable) return;

  const width = Math.abs(e.clientX - start.x);
  const height = Math.abs(e.clientY - start.y);
  const left = Math.min(start.x, e.clientX);
  const top = Math.min(start.y, e.clientY);

  placeholder.style.width = width + 'px';
  placeholder.style.height = height + 'px';
  placeholder.style.top = top + 'px';
  placeholder.style.left = left + 'px';
}

el.addEventListener('pointermove', handleOnPointMove);
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId);
  isEnable = true;

  start.x = e.clientX;
  start.y = e.clientY;

  placeholder.style.visibility = 'visible';
});
el.addEventListener('pointerup', () => {
  const rect = placeholder.getBoundingClientRect();
  el.append(createRect(rect.width, rect.height, rect.top, rect.left));

  isEnable = false;

  placeholder.style.visibility = 'hidden';
  placeholder.style.width = '0';
  placeholder.style.height = '0';
});

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  el.style.width = size.width + 'px';
  el.style.height = size.height + 'px';
});

function createRect(width: number, height: number, top: number, left: number) {
  const id = crypto.randomUUID();

  const div = document.createElement('div');
  div.id = id;
  div.style.position = 'absolute';
  div.style.width = width + 'px';
  div.style.height = height + 'px';
  div.style.top = top + 'px';
  div.style.left = left + 'px';
  div.style.background = Colors.GOLD2;

  rects[id] = div;

  return div;
}
