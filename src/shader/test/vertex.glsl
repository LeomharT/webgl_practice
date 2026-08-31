#include <simplex4DNoise>

uniform float uTime;

varying vec3 vNormal;

attribute vec4 tangent;

float getWobble(vec3 p, float t) {
  float wobble = snoise(vec4(p, t * 0.145)) * 0.8;
  return wobble;
}

void main() {
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;
  vec3 biTangent = cross(modelNormal, tangent.xyz);

  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA = modelPosition.xyz + shift * tangent.xyz;
  vec3 positionB = modelPosition.xyz + shift * biTangent;

  float wobble = getWobble(modelPosition.xyz, uTime);

  modelPosition.xyz += wobble * modelNormal;
  positionA.xyz += getWobble(positionA, uTime) * modelNormal;
  positionB.xyz += getWobble(positionB, uTime) * modelNormal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // VARYING
  vNormal = N;
}
