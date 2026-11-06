import {
  dot,
  Fn,
  mul,
  normalView,
  positionLocal,
  positionViewDirection,
  texture,
  time,
  TWO_PI,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  Texture,
  UniformNode,
} from 'three/webgpu';

export class Shield {
  constructor(_texture: Texture, radius: number = 2) {
    this.texture = _texture;
    this.radius = uniform(radius);

    this.geometry = this._setGeometry();
    this.material = this._setMaterial();
    this.mesh = this._setMesh();
  }

  public radius: UniformNode<'float', number>;

  public texture: Texture;

  public geometry: SphereGeometry;

  public material: MeshBasicNodeMaterial;

  public mesh: Mesh;

  private _setGeometry() {
    const geometry = new SphereGeometry(1, 32, 32);

    return geometry;
  }

  private _setMaterial() {
    const fresnel = dot(positionViewDirection, normalView).abs().oneMinus();

    // Hexagons
    const hexagonsColor = texture(this.texture, uv().mul(vec2(6, 4)));
    const hexagonsStep = time
      .add(hexagonsColor.g.mul(TWO_PI))
      .sin()
      .remap(-1, 1);
    const hexagonsMask = hexagonsStep.step(hexagonsColor.r);
    const hexagonsPolarMask = uv().y.sub(0.5).abs().remapClamp(0.35, 0.2);
    const hexagonsFresnelMask = fresnel.pow2();
    const hexagonsFill = hexagonsColor.r;
    const hexagons = mul(
      hexagonsMask,
      hexagonsColor.b,
      hexagonsPolarMask,
      hexagonsFresnelMask,
      hexagonsFill,
    );

    const material = new MeshBasicNodeMaterial({
      transparent: true,
    });
    material.colorNode = Fn(() => {
      return vec4(vec3(hexagons), 1.0);
    })();

    material.positionNode = positionLocal.mul(this.radius);

    return material;
  }

  private _setMesh() {
    const mesh = new Mesh(this.geometry, this.material);

    return mesh;
  }
}
