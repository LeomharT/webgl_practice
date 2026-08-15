precision mediump float;

varying vec4 vTexutreMatrix;
varying vec2 vUv;

uniform sampler2D uRelfectorTexture;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;

uniform float uDistrubeAmount;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(0.04);

  vec3 normal = texture2D(uNormalMap, vUv).rgb;
  normal = normal * 2.0 - 1.0;

  vec2 reflectUv = vTexutreMatrix.xy / vTexutreMatrix.w;
  vec2 finalUv = reflectUv + normal.xy * uDistrubeAmount;

  vec4 reflectorColor = texture2D(uRelfectorTexture, finalUv);

  color = reflectorColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
