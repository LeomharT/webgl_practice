varying vec2 vUv;

uniform float uTime;

#include <worley3D>

void main() {
  vec3 color = vec3(1.0);

  vec2 uv = vUv;
  uv *= 10.0;

  vec3 worleyInput = vec3(uv, uTime * 0.2);
  vec2 noise = worley(worleyInput, 1.0, false);

  color = vec3(noise.x);

  gl_FragColor = vec4(color, 1.0);
}
