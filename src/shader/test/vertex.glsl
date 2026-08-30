
#include <simplex4DNoise>

varying vec3 vNormal;

float getWobble(vec3 p, float t) {
  float wobble = snoise(vec4(p, t));
  return wobble;
}

void main() {
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;

  vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
       modelPosition.xyz += getWobble(modelPosition.xyz, 0.0) * modelNormal;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectionPosition;

  vNormal = modelNormal;
}
