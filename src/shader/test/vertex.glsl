uniform float uSize;
uniform float uProgress;
uniform vec2 uResolution;

attribute vec3 aPositionTarget;

#include <simplex3DNoise>

void main() {
  vec3 p = mix(position, aPositionTarget, uProgress);

  vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
  vec4 projectionPosition = projectionMatrix * modelViewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -modelViewPosition.z;
}
