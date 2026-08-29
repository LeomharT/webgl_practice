uniform float uProgress;
uniform float uSize;
uniform vec2 uResolution;

attribute vec3 aPositionTarget;

varying vec3 vColor;

#include <simplex3DNoise>

void main() {
  float noise = snoise(position);
        noise = (noise + 1.0) / 2.0;

  float duration = 0.4;
  float delay    = (1.0 - duration) * noise;
  float end      = duration + delay;
  float progress = smoothstep(delay, end, uProgress);

  vec3 p = mix(position, aPositionTarget, progress);

  vec4 modelViewPosition  = modelViewMatrix * vec4(p, 1.0);
  vec4 projectionPosition = projectionMatrix * modelViewPosition;

  gl_Position = projectionPosition;

  gl_PointSize  = uSize * uResolution.y;
  gl_PointSize *= 1.0 / -modelViewPosition.z;


  // VARYING
  vColor = mix(
    vec3(1.0, 0.212, 0.373),
    vec3(0.123, 1.0, 0.331),
    noise
  );
}
