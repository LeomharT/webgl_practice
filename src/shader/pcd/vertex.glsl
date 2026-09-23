uniform float uSize;
uniform vec2 uResolution;
uniform float uMinHeight;
uniform float uMaxHeight;

varying float vHeight;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  float height = (position.y - uMinHeight) / (uMaxHeight - uMinHeight);
  height = clamp(height, 0.0, 1.0);

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -mvPosition.z;

  // VARYING
  vHeight = height;
}
