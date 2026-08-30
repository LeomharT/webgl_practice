precision mediump float;

uniform float uTime;

varying vec3 vNormal;

#include <simplex4DNoise>

void main() {
  float noise = snoise(vec4(position, uTime));

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal   = transpose(inverse(mat3(modelMatrix))) * normal;

  // modelPosition.xyz += noise * modelNormal;

  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = modelNormal;
}
