precision mediump float;

varying vec4 vTexturePosition;
varying vec2 vUv;

uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;

uniform float uBlurStrength;
uniform float uNormalBias;

void main() {
  vec3 color = vec3(0.0);
  vec2 uv = vUv;

  vec4 normalColor = texture2D(uNormalTexture, uv);
  normalColor = normalColor * 2.0 - 1.0;
  vec3 normal = normalColor.rgb;

  float roughness = texture2D(uRoughnessTexture, uv).g;

  vec2 textureUV = vTexturePosition.xy / vTexturePosition.w;
  vec2 finalUV = textureUV + normal.xy * uNormalBias;
  float level = roughness * uBlurStrength;

  vec4 reflectorColor = texture2D(uReflectorTexture, finalUV, level);

  color = reflectorColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
