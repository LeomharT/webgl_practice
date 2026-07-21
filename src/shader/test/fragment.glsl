varying vec4 vTextureUv;
varying vec2 vUv;

uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;

uniform float uDisturbedAmount;
uniform float uBlurStrength;

void main() {
  vec3 color = vec3(0.0);
  vec2 uv = vUv;

  vec4 normal = texture2D(uNormalTexture, vUv);
  normal = normal * 2.0 - 1.0;

  float roughness = texture2D(uRoughnessTexture, vUv).g;

  vec2 reflectUv = vTextureUv.xy / vTextureUv.w;
  vec2 finalUv = reflectUv + normal.xy * uDisturbedAmount;
  float level = roughness * uBlurStrength;

  vec4 reflectColor = texture2D(uReflectorTexture, finalUv, level);

  color = reflectColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
