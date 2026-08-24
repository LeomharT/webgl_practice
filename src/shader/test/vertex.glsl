uniform float uSize;
uniform vec2 uResolution;

varying vec3 vColor;

void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 projectionPosition = projectionMatrix * modelViewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -modelViewPosition.z;

  //VARYING
  vColor = vec3(1.0);
}
