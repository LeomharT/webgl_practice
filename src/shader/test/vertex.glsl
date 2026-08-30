precision mediump float;

#include <simplex4DNoise>

void main() {
  float noise = snoise(vec4(position, 0.0));

  vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
       modelPosition.xyz += noise * normal;

  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
}
