varying vec2 vUv;

uniform float uTime;

uniform vec3 uColorA;
uniform vec3 uColorB;

#include <worley3D>

void main() {
  vec3 color = vec3(1.0);

  vec2 uv = vUv;
  uv *= 10.0;

  vec3 worleyInput = vec3(uv, uTime * 0.2);
  vec2 noise = worley(worleyInput, 1.0, false);

  float worley = noise.x;

  color = mix(uColorA, uColorB, worley);

  gl_FragColor = vec4(color, 1.0);
}
