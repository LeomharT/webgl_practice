import {
  max,
  mx_noise_float,
  nodeObject,
  vec3,
  vec4,
  viewportCoordinate,
  viewportSize,
} from 'three/tsl';
import { Node, TempNode, UniformNode } from 'three/webgpu';
import { voronoi } from '../voronoi';
export default class ShatterNode extends TempNode {
  static get type() {
    return 'ShaterNode';
  }

  constructor(
    textureNode: Node,
    subdivision: UniformNode<'float', number>,
    seed: UniformNode<'int', number>,
    progress: UniformNode<'float', number>,
    thickness: UniformNode<'float', number>,
  ) {
    super('vec4');

    this._textureNode = textureNode;
    this._subdivision = subdivision;
    this._seed = seed;
    this._progress = progress;
    this._thickness = thickness;
  }

  private _textureNode: Node;
  private _subdivision: UniformNode<'float', number>;
  private _seed: UniformNode<'int', number>;
  private _progress: UniformNode<'float', number>;
  private _thickness: UniformNode<'float', number>;

  public setup() {
    const viewportMaxSize = max(viewportSize.x, viewportSize.y);
    const voronoiUv = viewportCoordinate.div(viewportMaxSize);

    // @ts-expect-error
    const voronoiColor = voronoi(voronoiUv, this._subdivision, this._seed);

    const cracksNoise = mx_noise_float(voronoiUv.mul(5)).remap(-1, 1, 0, 0.5);
    const cracks = voronoiColor.g.step(
      this._progress.sub(cracksNoise).mul(this._thickness),
    );

    return vec4(vec3(cracks), 1.0);
  }
}

export const shatter = (
  textureNode: Node,
  subdivision: UniformNode<'float', number>,
  seed: UniformNode<'int', number>,
  progress: UniformNode<'float', number>,
  thickness: UniformNode<'float', number>,
) =>
  new ShatterNode(
    textureNode,
    nodeObject(subdivision),
    nodeObject(seed),
    nodeObject(progress),
    nodeObject(thickness),
  );
