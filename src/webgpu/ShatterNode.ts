import {
  convertToTexture,
  max,
  mix,
  mx_noise_float,
  nodeObject,
  sqrt,
  texture,
  TWO_PI,
  vec2,
  viewportCoordinate,
  viewportSize,
  viewportUV,
} from 'three/tsl';
import { Color, Node, TempNode, TextureNode, UniformNode } from 'three/webgpu';
import { voronoi } from '../voronoi';
export default class ShatterNode extends TempNode {
  static get type() {
    return 'ShaterNode';
  }

  constructor(
    textureNode: TextureNode,
    subdivision: UniformNode<'float', number>,
    seed: UniformNode<'int', number>,
    progress: UniformNode<'float', number>,
    thickness: UniformNode<'float', number>,
    color: UniformNode<'color', Color>,
    colorStrgenth: UniformNode<'float', number>,
  ) {
    super('vec4');

    this._textureNode = textureNode;
    this._subdivision = subdivision;
    this._seed = seed;
    this._progress = progress;
    this._thickness = thickness;
    this._color = color;
    this._colorStrgenth = colorStrgenth;
  }

  private _textureNode: TextureNode;
  private _subdivision: UniformNode<'float', number>;
  private _seed: UniformNode<'int', number>;
  private _progress: UniformNode<'float', number>;
  private _thickness: UniformNode<'float', number>;
  private _color: UniformNode<'color', Color>;
  private _colorStrgenth: UniformNode<'float', number>;

  public setup() {
    const viewportMaxSize = max(viewportSize.x, viewportSize.y);
    const voronoiUv = viewportCoordinate.div(viewportMaxSize);

    // @ts-expect-error
    const voronoiColor = voronoi(voronoiUv, this._subdivision, this._seed);

    const cracksNoise = mx_noise_float(voronoiUv.mul(5)).remap(-1, 1, 0, 0.5);
    const cracks = voronoiColor.g.step(
      this._progress.sub(cracksNoise).mul(this._thickness),
    );
    const cracksColor = this._color.mul(this._colorStrgenth);

    // Offset UV
    const goldenRatio = sqrt(5).add(1).div(2);
    const goldenAngle = goldenRatio.mul(TWO_PI);
    const angle = voronoiColor.a.mul(goldenAngle);
    const offset = vec2(angle.cos(), angle.sin()).mul(this._progress);
    const offsetUv = viewportUV.add(offset.mul(0.02));

    return mix(cracksColor, texture(this._textureNode, offsetUv), cracks);
  }
}

export const shatter = (
  textureNode: Node,
  subdivision: UniformNode<'float', number>,
  seed: UniformNode<'int', number>,
  progress: UniformNode<'float', number>,
  thickness: UniformNode<'float', number>,
  color: UniformNode<'color', Color>,
  colorStrgenth: UniformNode<'float', number>,
) =>
  new ShatterNode(
    convertToTexture(textureNode),
    nodeObject(subdivision),
    nodeObject(seed),
    nodeObject(progress),
    nodeObject(thickness),
    nodeObject(color),
    nodeObject(colorStrgenth),
  );
