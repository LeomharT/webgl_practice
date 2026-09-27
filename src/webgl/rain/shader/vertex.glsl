uniform mat4 uTextureMatrix;

varying vec4 vTexturePosition;
varying vec2 vUv;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vUv = uv;
  vTexturePosition = uTextureMatrix * vec4(position, 1.0);
}
