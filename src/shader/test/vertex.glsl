uniform float uSize;
uniform vec2 uResolution;

void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

  #include <begin_vertex>
  #include <project_vertex>

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -modelViewPosition.z;
}
