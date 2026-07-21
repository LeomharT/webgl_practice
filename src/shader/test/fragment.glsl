varying vec4 vTextureUv;
varying vec2 vUv;

uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;

void main() {
  vec3 color = vec3(0.0);
  vec2 uv    = vUv;

  vec4 normal = texture2D(uNormalTexture, vUv);
  normal = normal * 2.0 - 1.0;

  vec2 reflectUv = vTextureUv.xy / vTextureUv.w;
  vec2 finalUv   = reflectUv + normal.xy * 0.5;

  vec4 reflectColor = texture2D(uReflectorTexture, finalUv);

  color = reflectColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}