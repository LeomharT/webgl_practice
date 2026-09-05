#include <simplex4DNoise>

attribute vec4 tangent;

varying vec3 vNormal;

uniform float uTime;

float getWobble(vec3 v, float t) {
  return snoise(vec4(v * 0.812, t)) * 0.8;
}

void main() {
  vec3 biTangent = cross(normal, tangent.xyz);

  float shift = 0.01;
  float noise = getWobble(position, uTime * 0.2);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA = modelPosition.xyz + shift * tangent.xyz;
  vec3 positionB = modelPosition.xyz + shift * biTangent;

  modelPosition.xyz += noise * normal;
  positionA += getWobble(positionA, uTime * 0.2) * normal;
  positionB += getWobble(positionB, uTime * 0.2) * normal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // VARYING
  vNormal = N;
}
