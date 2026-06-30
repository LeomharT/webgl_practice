varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vReflection;

uniform sampler2D uNormal;
uniform sampler2D uRoughness;
uniform sampler2D uReflectorTexture;

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;
  vec3 normal = normalize(vNormal);
  float r = 1.0;

  float roughness = texture2D(uRoughness, uv).g;

  vec3 N = texture2D(uNormal, uv).rgb * 2.0 - 1.0;

  float diffuse = max(dot(N, normalize(vec3(0.0, 1.25, 1.0))), 0.0);
  vec3 finalColor = color * diffuse;

  vec3 baseColor = vec3(0.125, 0.001, 0.0285);

  vec2 reflectUV = vReflection.xy / vReflection.w;
  vec2 finalUV = reflectUV + N.xy * 0.5;

  vec4 reflectionColor = texture2D(uReflectorTexture, finalUV, roughness);

  color = reflectionColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
