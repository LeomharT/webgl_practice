varying vec4 vTextureUv;
varying vec2 vUv;

uniform mat4 uTextureMatrix;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vUv        = uv;
  vTextureUv = uTextureMatrix * vec4(position, 1.0);
}