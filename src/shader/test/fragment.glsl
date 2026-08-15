varying vec4 vTexutreMatrix;
varying vec2 vUv;

uniform sampler2D uRelfectorTexture;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(0.04);
  vec4 reflectUv = vTexutreMatrix;

  vec4 reflectorColor = texture2D(uRelfectorTexture, reflectUv.xy / reflectUv.w);

  color += reflectorColor.rgb;

  gl_FragColor = vec4(color, 1.0);
}
