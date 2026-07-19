varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vPosition = modelPosition.xyz;
  vNormal = modelNormal;
}
