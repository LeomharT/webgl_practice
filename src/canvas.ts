import { Colors } from '@blueprintjs/colors';
import { Application, Container, Graphics } from 'pixi.js';

const root = document.querySelector('#root');

const app = new Application();

await app.init({
  antialias: true,
  backgroundAlpha: 1,
  resizeTo: window,
  backgroundColor: Colors.BLACK,
});

root?.append(app.canvas);

const container = new Container();
app.stage.addChild(container);

const obj = new Graphics()
  .rect(0, 0, 200, 100) // Create a rectangle with dimensions 200x100
  .fill('red'); // Fill the rectangle with a red color
obj.eventMode = 'static';

obj.on('pointerdown', console.warn);

container.addChild(obj);
