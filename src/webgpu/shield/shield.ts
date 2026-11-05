import { Mesh, SphereGeometry } from 'three';
import { positionLocal, uniform } from 'three/tsl';
import { MeshBasicNodeMaterial, UniformNode } from 'three/webgpu';

export class Shield {
  constructor(radius: number = 2) {
    this.radius = uniform(radius);

    this.geometry = this._setGeometry();
    this.material = this._setMaterial();
    this.mesh = this._setMesh();
  }

  public radius: UniformNode<'float', number>;

  public geometry: SphereGeometry;

  public material: MeshBasicNodeMaterial;

  public mesh: Mesh;

  private _setGeometry() {
    const geometry = new SphereGeometry(1, 32, 32);

    return geometry;
  }

  private _setMaterial() {
    const material = new MeshBasicNodeMaterial();
    material.positionNode = positionLocal.mul(this.radius);

    return material;
  }

  private _setMesh() {
    const mesh = new Mesh(this.geometry, this.material);

    return mesh;
  }
}
