varying vec2 vUv;

uniform float uTime;

uniform vec3 uColorA;
uniform vec3 uColorB;

uniform sampler2D uUvChecker;

#include <worley3D>

void main() {
  vec3 color = vec3(1.0);

  vec2 uv = vUv;
  uv *= 20.0;

  vec4 textureColor = texture2D(uUvChecker, vUv);

  vec3 worleyInput = vec3(uv, 0.0);
  vec2 noise = worley(worleyInput, 1.0, false);

  float worley = noise.x;
  worley = pow(worley, 2.0);

  color = mix(textureColor.rgb, uColorA, worley);

  gl_FragColor = vec4(color, 1.0);
}
