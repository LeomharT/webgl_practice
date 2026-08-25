uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uHeightRange;

varying vec3 vColor;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float h = smoothstep(uHeightRange.x, uHeightRange.y, modelPosition.y);
  h = clamp(h, 0.0, 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -viewPosition.z;

  vColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), h);
}
