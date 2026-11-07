import gsap from 'gsap';
import {
  dot,
  float,
  Fn,
  Loop,
  max,
  mul,
  normalView,
  positionLocal,
  positionViewDirection,
  texture,
  time,
  TWO_PI,
  uniform,
  uniformArray,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {
  ConstNode,
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  Texture,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
} from 'three/webgpu';

export class Shield {
  constructor(_texture: Texture, radius: number = 2) {
    this.texture = _texture;
    this.radius = uniform(radius);

    this._setInpacts();
    this.geometry = this._setGeometry();
    this.material = this._setMaterial();
    this.mesh = this._setMesh();
  }

  public radius: UniformNode<'float', number>;

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
