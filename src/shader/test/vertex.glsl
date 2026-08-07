varying vec3 vColor;

#include <simplex4DNoise>

float getElevation(vec3 p) {
  float noise = snoise(vec4(p, 0.0));

  return noise;
}

void main() {
  float noise = getElevation(position);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;
  modelPosition.xyz += noise * modelNormal;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // VARYING
  vColor = mix(vec3(1.0, 0.0, 0.25), vec3(0.1, 1.0, 0.785), noise);
}
