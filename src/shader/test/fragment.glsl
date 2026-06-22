varying vec3 vNormal;
varying vec2 vUv;

uniform vec3 uSunDirection;
uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform sampler2D uSpecularCloudTexture;

void main() {
  vec2 uv     = vUv;
  vec3 color  = vec3(0.0);
  vec3 normal = normalize(vNormal);

  vec3 sunDirection = uSunDirection;

  vec4 dayMapColor   = texture2D(uDayMapTexture, uv);
  vec4 nightMapColor = texture2D(uNightMapTexture, uv);
  vec4 specularColor = texture2D(uSpecularCloudTexture, uv);

  float dayMix = dot(sunDirection, normal);
        dayMix = smoothstep(-0.25, 0.5, dayMix);

  color = mix(
    nightMapColor.rgb,
    dayMapColor.rgb,
    dayMix
  );

  float cloudMix = smoothstep(0.3, 1.0, specularColor.g);

  color = mix(
    color,
    vec3(1.0),
    cloudMix * dayMix
  );

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
