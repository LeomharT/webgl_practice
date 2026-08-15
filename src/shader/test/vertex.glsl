uniform mat4 uTextureMatrix;

varying vec4 vTexutreMatrix;
varying vec2 vUv;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vTexutreMatrix = uTextureMatrix * vec4(position, 1.0);
  vUv = uv;
}
