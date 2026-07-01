varying vec2 vUv;
varying vec4 vReflection;

uniform sampler2D uNormal;
uniform sampler2D uRoughness;
uniform sampler2D uReflectorTexture;
uniform float uNormalBias;
uniform float uLevel;

void main() {
  vec3 color = vec3(1.0);
  vec2 uv    = vUv;

  float roughness = texture2D(uRoughness, uv).g;
  vec3  N         = texture2D(uNormal, uv).rgb * 2.0 - 1.0;

  vec2  reflectUV = vReflection.xy / vReflection.w;
  vec2  finalUV   = reflectUV + N.xy * uNormalBias;
  float level     = roughness * uLevel;

  vec4 reflectionColor = texture2D(uReflectorTexture, finalUV, level);

  color = reflectionColor.rgb;
 
  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
