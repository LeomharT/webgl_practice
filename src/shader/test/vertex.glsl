#define COLOR_A vec3(1.0, 0.0, 0.0)
#define COLOR_B vec3(0.0, 0.0, 1.0)

uniform float uSize;
uniform float uProgress;
uniform vec2 uResolution;

attribute vec3 aPositionTarget;

varying vec3 vColor;

#include <simplex3DNoise>

void main() {
  float noiseA = snoise(position * 0.25);
  float noiseB = snoise(aPositionTarget * 0.25);

  float noise = mix(noiseA, noiseB, uProgress);
  noise = (noise + 1.0) / 2.0;

  float duration = 0.4;
  float delay = (1.0 - duration) * noise;
  float end = duration + delay;
  float progress = smoothstep(delay, end, uProgress);

  vec3 p = mix(position, aPositionTarget, progress);

  vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
  vec4 projectionPosition = projectionMatrix * modelViewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -modelViewPosition.z;

  vColor = mix(COLOR_A, COLOR_B, noise);
}
