import { Colors } from '@blueprintjs/colors';
import Konva from 'konva';
import { RAD2DEG } from 'three/src/math/MathUtils.js';

// Enable shape event pointer capture
Konva.capturePointerEventsEnabled = true;

// Stage
const stage = new Konva.Stage({
  container: 'root',
  width: window.innerWidth,
  height: window.innerHeight,
});

const container = stage.container();

// Layer 0
const layer = new Konva.Layer({});
stage.add(layer);

const prevCoord = {
  x: 0,
  y: 0,
  theta: 0,
};

let isDraggin = false;
let isResizing = false;
let isRotating = false;

// World
const group = new Konva.Group({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
});
layer.add(group);

const rect = new Konva.Rect({
  width: 200,
  height: 200,
  fill: Colors.VIOLET4,
});
group.offset({
  x: rect.size().width / 2,
  y: rect.size().height / 2,
});
group.add(rect);

rect.on('pointerenter', () => {
  container.style.cursor = 'grab';
});
rect.on('pointerleave', () => {
  container.style.cursor = 'default';
});
rect.on('pointerdown', () => {
  isDraggin = true;
  container.style.cursor = 'grabbing';

  const position = stage.getPointerPosition()!;

  prevCoord.x = position.x;
  prevCoord.y = position.y;
});
rect.on('pointerup', () => {
  isDraggin = false;
  container.style.cursor = 'grab';
});
rect.on('pointermove', () => {
  if (!isDraggin) return;

  const stagePosition = stage.getPointerPosition()!;
  const targetPosition = group.getPosition();

  const tx = stagePosition.x - prevCoord.x;
  const ty = stagePosition.y - prevCoord.y;

  group.setPosition({
    x: tx + targetPosition.x,
    y: ty + targetPosition.y,
  });

  prevCoord.x = stagePosition.x;
  prevCoord.y = stagePosition.y;
});

// Rotation
const rotationHandleButtomLeft = new Konva.Rect({
  width: 20,
  height: 20,
  stroke: Colors.BLUE5,
});
rotationHandleButtomLeft.setPosition({
  x: rect.size().width,
  y: rect.size().height,
});
rotationHandleButtomLeft.on('pointerdown', () => {
  isRotating = true;

  const cursor = stage.getPointerPosition()!;
  const center = group.position();

  prevCoord.theta = Math.atan2(cursor.y - center.y, cursor.x - center.x);
});
rotationHandleButtomLeft.on('pointerup', () => {
  isRotating = false;
});
rotationHandleButtomLeft.on('pointermove', () => {
  if (!isRotating) return;

  const cursor = stage.getPointerPosition()!;
  const center = group.position();

  const next = Math.atan2(cursor.y - center.y, cursor.x - center.x);
  const theta = next - prevCoord.theta;

  group.rotate(theta * RAD2DEG);

  prevCoord.theta = next;
});

group.add(rotationHandleButtomLeft);

// Translate
const resizeHandleButtomLeft = new Konva.Rect({
  width: 10,
  height: 10,
  stroke: Colors.BLUE5,
});
resizeHandleButtomLeft.setPosition({
  x: rect.size().width,
  y: rect.size().height,
});
resizeHandleButtomLeft.on('pointerenter', () => {
  container.style.cursor = 'crosshair';
});
resizeHandleButtomLeft.on('pointerleave', () => {
  container.style.cursor = 'default';
});
resizeHandleButtomLeft.on('pointerdown', () => {
  isResizing = true;

  const cursor = stage.getPointerPosition()!;

  prevCoord.x = cursor.x;
  prevCoord.y = cursor.y;
});
resizeHandleButtomLeft.on('pointerup', () => {
  isResizing = false;
});
resizeHandleButtomLeft.on('pointermove', () => {
  if (!isResizing) return;

  const theta = group.rotation() * (Math.PI / 180);

  const c = Math.cos(theta);
  const s = Math.sin(theta);

  const cursor = stage.pointerPos;
  if (!cursor) return;

  const dx = cursor.x - prevCoord.x;
  const dy = cursor.y - prevCoord.y;

  const localDx = dx * c + dy * s;
  const localDy = dx * -s + dy * c;

  const targetSize = rect.size();
  rect.setSize({
    width: targetSize.width + localDx,
    height: targetSize.height + localDy,
  });

  updateHandlesPosition();

  group.offset({
    x: rect.size().width / 2,
    y: rect.size().height / 2,
  });

  group.setPosition({
    x: group.position().x + dx / 2,
    y: group.position().y + dy / 2,
  });

  prevCoord.x = cursor.x;
  prevCoord.y = cursor.y;
});

group.add(resizeHandleButtomLeft);

function updateHandlesPosition() {
  for (const h of [resizeHandleButtomLeft, rotationHandleButtomLeft]) {
    const x = rect.width();
    const y = rect.height();

    h.position({ x, y });
  }
}
