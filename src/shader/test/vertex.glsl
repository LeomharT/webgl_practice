#include <simplex4DNoise>

void main() {
  float noise = snoise(vec4(position * 0.812, 0.786)) * 0.8;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.xyz += noise * normal;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
}
