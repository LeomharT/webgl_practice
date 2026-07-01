varying vec2 vUv;
varying vec4 vTextureMatrix;

uniform mat4 uTextureMatrix;


void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vUv            = uv;
  vTextureMatrix = uTextureMatrix * vec4(position, 1.0);
}