varying vec2 vUv;
varying vec4 vTextureMatrix;

uniform sampler2D uReflectTexture;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;

uniform float uDistortionAmount;
uniform float uBlurStrength;


void main() {
  vec3 color         = vec3(0.0);
  vec2 uv            = vUv;
  vec4 textureMatrix = vTextureMatrix;

  float roughness = texture2D(uRoughnessMap, uv).g;
  vec3  normal    = texture2D(uNormalMap, uv).rgb * 2.0 - 1.0;

  vec2  reflectUV = textureMatrix.xy / textureMatrix.w;
  vec2  finalUV   = reflectUV + normal.xy * uDistortionAmount;
  float level     = roughness * uBlurStrength;

  vec4 reflectColor = texture2D(uReflectTexture, finalUV, level);

  color = reflectColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}