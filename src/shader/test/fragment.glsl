varying vec3 vColor;
varying vec3 vPosition;

uniform float uProgress;

#include <simplex3DNoise>

void main() {
  vec3 color = vColor;
  vec2 uv = gl_PointCoord;

  float noise = snoise(vPosition);
  noise = (noise + 1.0) / 2.0;

  if (noise < uProgress) discard;

  if (bool(uProgress) && noise < uProgress + 0.1) color = vec3(1.0);

  float dist = length(uv - 0.5);
  float alpha = 0.05 / dist - 0.1;

  gl_FragColor = vec4(color, alpha);
}
