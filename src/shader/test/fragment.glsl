#define PI 3.1415926

varying vec2 vUv;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

vec2 rotate2D(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);

  mat2 m = transpose(mat2(c, -s, s, c));

  return m * v;
}

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;

  uv -= 0.5;
  uv = rotate2D(uv, uTime);

  float angle = atan(uv.x, uv.y);
  angle += PI;
  angle /= PI * 2.0;

  uv += 0.5;

  color = mix(uColorA, uColorB, angle);

  float dist = distance(uv, vec2(0.5));
  dist = smoothstep(0.2, 0.5, dist);

  gl_FragColor = vec4(color, 1.0 - dist);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
