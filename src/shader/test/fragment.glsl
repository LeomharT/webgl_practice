varying vec2 vUv;

uniform float uTime;

#include <random2D>
#include <simplex2DNoise>

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;
  uv *= 5.0;

  float noise = snoise(uv);
  noise *= 5.0;
  noise += uTime;
  noise = fract(noise);
  noise = step(noise, 0.8);

  color = vec3(1.0 - noise);

  gl_FragColor = vec4(color, 1.0);
}
