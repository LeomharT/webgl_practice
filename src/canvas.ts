import { Colors } from '@blueprintjs/colors';
import { fs, vs } from './penger';
import './style.css';

type Vector2 = {
  x: number;
  y: number;
};

type Vector3 = Vector2 & {
  z: number;
};

const el = document.querySelector('#root');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
};

const canvas = document.createElement('canvas');
canvas.width = sizes.width;
canvas.height = sizes.height;
canvas.style.width = sizes.width + 'px';
canvas.style.height = sizes.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clear() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, sizes.width, sizes.height);
  ctx.restore();
}
clear();

function point(v: Vector2) {
  ctx.save();

  const s = 10;
  ctx.fillStyle = Colors.CERULEAN3;
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);

  ctx.restore();
}

function screen(v: Vector2) {
  const x = ((v.x + 1.0) / 2.0) * sizes.width;
  const y = -((v.y - 1.0) / 2.0) * sizes.height;

  return { x, y };
}

function project(v: Vector3) {
  return {
    x: v.x / v.z,
    y: (v.y / v.z) * sizes.aspect,
  };
}

function translateZ(v: Vector3, dz: number) {
  return { ...v, z: v.z + dz };
}

function line(from: Vector2, to: Vector2) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  ctx.lineWidth = 3;
  ctx.strokeStyle = Colors.TURQUOISE3;
  ctx.stroke();

  ctx.restore();
}

function rotate(v: Vector3, angle: number) {
  const x = Math.cos(angle) * v.x - Math.sin(angle) * v.z;
  const z = Math.cos(angle) * v.z + Math.sin(angle) * v.x;

  return {
    ...v,
    x,
    z,
  };
}

const _vs = vs || [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

const _fs = fs || [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

let prevTime = 0;

let dz = 1.25;

let angle = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  // dz += dt;
  angle += dt;

  clear();

  for (const f of _fs) {
    for (let i = 0; i < f.length; i++) {
      const from = _vs[f[i]];
      const to = _vs[f[(i + 1) % f.length]];

      line(
        screen(project(translateZ(rotate({ ...from }, angle), dz))),
        screen(project(translateZ(rotate({ ...to }, angle), dz))),
      );
    }
  }

  for (const v of _vs) {
    point(screen(project(translateZ(rotate({ ...v }, angle), dz))));
  }

  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.aspect = sizes.width / sizes.height;

  canvas.width = sizes.width;
  canvas.height = sizes.height;
  canvas.style.width = sizes.width + 'px';
  canvas.style.height = sizes.height + 'px';
});
