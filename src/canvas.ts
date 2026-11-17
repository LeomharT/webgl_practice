import { Colors } from '@blueprintjs/colors';
import Konva from 'konva';

// Enable shape event pointer capture
Konva.capturePointerEventsEnabled = true;

// Stage
const stage = new Konva.Stage({
  container: 'root',
  width: window.innerWidth,
  height: window.innerHeight,
});

// Layer 0
const layer = new Konva.Layer({});
stage.add(layer);

const prevCoord = {
  x: 0,
  y: 0,
  theta: 0,
};

let isDraggin = false;

// World
const group = new Konva.Group({
  x: window.innerWidth / 2 - 100,
  y: window.innerHeight / 2 - 100,
});
layer.add(group);

const rect = new Konva.Rect({
  width: 200,
  height: 200,
  fill: Colors.VIOLET4,
});
group.add(rect);

rect.on('pointerdown', () => {
  isDraggin = true;

  const position = stage.getPointerPosition()!;

  prevCoord.x = position.x;
  prevCoord.y = position.y;
});
rect.on('pointerup', () => {
  isDraggin = false;
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

// Transformer
const resizeHandleButtomLeft = new Konva.Rect({
  width: 30,
  height: 30,
  stroke: Colors.BLUE5,
});
resizeHandleButtomLeft.setPosition({
  x: 200,
  y: 200,
});
resizeHandleButtomLeft.on('mousedown', () => {
  const cursor = stage.getPointerPosition();

  if (cursor) {
    prevCoord.x = cursor.x;
    prevCoord.y = cursor.y;
  }
});
group.add(resizeHandleButtomLeft);
