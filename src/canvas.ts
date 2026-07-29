import './style.css';
import { fs, vs } from './untitled_penger';

type Vector2 = {
  x: number;
  y: number;
};

type Vector3 = Vector2 & {
  z: number;
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
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
  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, sizes.width, sizes.height);
  ctx.restore();
}

clean();

function point(v: Vector2) {
  ctx.save();
  const s = 5;
  ctx.fillStyle = '#7961DB';
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);
  ctx.restore();
}

function screen(v: Vector2) {
  const x = (v.x + 1.0) / 2.0;
  const y = -(v.y - 1.0) / 2.0;

  return {
    x: x * sizes.width,
    y: y * sizes.height,
  };
}

function project(v: Vector3) {
  return {
    x: v.x / v.z,
    y: (v.y / v.z) * sizes.aspect,
  };
}

function translateZ(v: Vector3, dz: number) {
  return {
    ...v,
    z: v.z + dz,
  };
}

function line(from: Vector2, to: Vector2) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = '#13C9BA';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

function rotate(v: Vector3, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const x = v.x * c - v.z * s;
  const z = v.x * s + v.z * c;

  return {
    ...v,
    x,
    z,
  };
}

const _vs = vs ?? [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

const _fs = fs ?? [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

let prevTime = 0;

let dz = 3;

let angle = 0;

function render(time: number = 0) {
  const dt = (time - prevTime) / 1000;
  prevTime = time;

  // dz += dt;
  angle += dt;

  clean();

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
