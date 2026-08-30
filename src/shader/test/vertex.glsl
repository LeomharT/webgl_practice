precision mediump float;

uniform float uTime;

varying vec3 vNormal;

#include <simplex4DNoise>

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float noise = snoise(vec4(modelPosition.xyz, uTime)) * 0.2;

  vec3 positionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
  vec3 positionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  modelPosition.y += noise;
  positionA.y += snoise(vec4(positionA, uTime)) * 0.2;
  positionB.y += snoise(vec4(positionB, uTime)) * 0.2;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = N;
}
