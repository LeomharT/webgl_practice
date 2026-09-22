varying vec2 vUv;

#include <random2D>

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;
  vec2 grid = floor(uv * 10.0);

  float random = random(grid);

  color = vec3(random);

  gl_FragColor = vec4(color, 1.0);
}
