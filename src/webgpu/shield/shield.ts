import gsap from 'gsap';
import {
  add,
  color,
  dot,
  float,
  Fn,
  Loop,
  max,
  mix,
  mul,
  normalView,
  objectPosition,
  positionLocal,
  positionViewDirection,
  positionWorld,
  texture,
  time,
  TWO_PI,
  uniform,
  uniformArray,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import {
  AdditiveBlending,
  Color,
  ConstNode,
  DoubleSide,
  Mesh,
  MeshBasicNodeMaterial,
  Node,
  SphereGeometry,
  Texture,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
} from 'three/webgpu';

export class Shield {
  constructor(
    _texture: Texture,
    radius: number = 2,
    colorA = color(0x1a5bff),
    colorB = color(0xff2e43),
    strength = 7,
  ) {
    this.texture = _texture;
    this.radius = uniform(radius);
    this.colorA = uniform(colorA);
    this.colorB = uniform(colorB);
    this.strength = uniform(strength);

    this._setInpacts();
    this.geometry = this._setGeometry();
    this.material = this._setMaterial();
    this.mesh = this._setMesh();
    this.junctionNode = this._setJunctionNode();
  }

  public radius: UniformNode<'float', number>;

  public colorA: UniformNode<'color', Color>;

  public colorB: UniformNode<'color', Color>;

  public strength: UniformNode<'float', number>;

  public texture: Texture;

  public geometry: SphereGeometry;

  public material: MeshBasicNodeMaterial;

  public mesh: Mesh;

  public inpacts: {
    count: number;
    index: number;
    uniforms: UniformArrayNode<string>;
    add: (position: Vector3, radius?: number) => void;
  } = {} as typeof this.inpacts;

  public junctionNode: Node<'vec3'>;

  private _setInpacts = () => {
    this.inpacts.count = 5;
    this.inpacts.index = 0;

    // Uniforms array
    const data: Vector4[] = [];

    for (let i = 0; i < this.inpacts.count; i++) {
      data.push(new Vector4(0, 0, 0, 0));
    }

    this.inpacts.uniforms = uniformArray(data, 'vec4');

    // Add inpact
    this.inpacts.add = (position, radius = 1) => {
      const inpact = data[this.inpacts.index];

      // Position
      const localPosition = this.mesh.worldToLocal(position);

      inpact.x = localPosition.x;
      inpact.y = localPosition.y;
      inpact.z = localPosition.z;

      // Radius
      gsap.to(inpact, {
        w: radius,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(inpact, {
            w: 0,
            duration: 1,
            ease: 'power2.in',
          });
        },
      });

      // Update index
      this.inpacts.index++;

      if (this.inpacts.index >= this.inpacts.count) {
        this.inpacts.index = 0;
      }
    };
  };

  private _setGeometry() {
    const geometry = new SphereGeometry(1, 32, 32);

    return geometry;
  }

  private _setMaterial() {
    const material = new MeshBasicNodeMaterial({
      transparent: true,
      blending: AdditiveBlending,
      color: 0x000000,
      side: DoubleSide,
    });
    material.colorNode = Fn(() => {
      // Inpacts
      const finalInpact = float(0);

      Loop(this.inpacts.count, ({ i }) => {
        const inpactData = this.inpacts.uniforms.element(
          i,
        ) as unknown as ConstNode<'vec4', Vector4>;
        const inpactDistance = inpactData.xyz.distance(positionLocal);
        const inpact = inpactDistance.div(inpactData.w).oneMinus().max(0);

        finalInpact.assign(max(finalInpact, inpact));
      });

      finalInpact.assign(finalInpact.remap(0.4, 0, 1, 0));

      // Fresnel
      const fresnel = dot(positionViewDirection, normalView).abs().oneMinus();

      // Hexagons
      const hexagonsColor = texture(this.texture, uv().mul(vec2(6, 4)));
      const hexagonsStep = max(
        time.add(hexagonsColor.g.mul(TWO_PI)).sin().remap(-1, 1),
        finalInpact,
      );
      const hexagonsMask = hexagonsStep.step(hexagonsColor.r);
      const hexagonsPolarMask = uv().y.sub(0.5).abs().remapClamp(0.35, 0.2);
      const hexagonsFresnelMask = max(fresnel.pow2(), finalInpact);
      const hexagonsFill = max(hexagonsColor.r, finalInpact);
      const hexagons = mul(
        hexagonsMask,
        hexagonsColor.b,
        hexagonsPolarMask,
        hexagonsFresnelMask,
        hexagonsFill,
      );

      // Lines
      const linesStrength = positionWorld.y
        .mul(3)
        .sub(time)
        .sin()
        .remap(-1, 1)
        .mul(0.05);
      const lines = positionWorld.y
        .mul(20)
        .add(time)
        .fract()
        .pow(3)
        .mul(linesStrength);

      // Emissive
      const emissiveStrength = add(hexagons, fresnel.pow(5), lines).mul(
        this.strength,
      );
      const emisstive = mix(this.colorA, this.colorB, emissiveStrength).mul(
        emissiveStrength,
      );

      return vec3(emisstive);
    })();

    material.positionNode = positionLocal.mul(this.radius);

    return material;
  }

  private _setMesh() {
    const mesh = new Mesh(this.geometry, this.material);
    return mesh;
  }

  private _setJunctionNode() {
    const center = objectPosition(this.mesh);

    return Fn(() => {
      // Position wrold is from the target mesh
      const sdf = positionWorld.distance(center).sub(this.radius);

      const mask = sdf.negate().step(0);
      const strength = sdf
        .remapClamp(0, -0.2, 1, 0)
        .mul(mask)
        .pow(3)
        .mul(this.strength);

      const _color = mix(this.colorA, this.colorB, strength).mul(strength);

      return _color;
    })();
  }
}
