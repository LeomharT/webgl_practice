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
  float roughness = 1.0;

  vec4 reflectionColor = texture2DProj(uReflectorTexture, vReflection);

  float roughnessSample = texture2D(uRoughness, uv).g;
  float finalRoughness = roughnessSample * roughness;

  float alpha = finalRoughness * finalRoughness;

  vec3 normalColor = texture2D(uNormal, uv).rgb;
  vec3 distortion = normalColor.xyz * 2.0 - 1.0;

  float amount = 0.32;

  vec3 finalNormal = normalize(mix(normal, distortion, amount));

  float diffuse = max(dot(finalNormal, normalize(vec3(0.0, 1.25, 1.0))), 0.0);
  vec3 finalColor = color * diffuse;

  vec3 baseColor = vec3(1.0, 0.25, 0.485);

  color = baseColor + reflectionColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
