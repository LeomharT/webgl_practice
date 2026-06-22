varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal        = transpose(inverse(mat3(modelMatrix))) * normal;
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv       = uv;
  vNormal   = modelNormal;
  vPosition = modelPosition.xyz;
}
