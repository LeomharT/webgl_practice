precision mediump float;

#define DAYCOLOR vec3(1.0, 0.0, 0.0)
#define TWILIGHTCOLOR vec3(0.0, 1.0, 0.0)


varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform sampler2D uSpecularCloudTexture;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main() {
  vec2 uv            = vUv;
  vec3 color         = vec3(0.0);
  vec3 normal        = normalize(vNormal);
  vec3 viewDirection = normalize(vPosition - cameraPosition);

  vec3 sunDirection = uSunDirection;

  vec4 dayMapColor   = texture2D(uDayMapTexture, uv);
  vec4 nightMapColor = texture2D(uNightMapTexture, uv);
  vec4 specularColor = texture2D(uSpecularCloudTexture, uv);

  float orientation = dot(sunDirection, normal);

   float dayMix = smoothstep(-0.25, 0.5, orientation);

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

  float fresnel = 1.0 + dot(viewDirection, normal);
        fresnel = max(0.0, fresnel);
        fresnel = pow(fresnel, 2.0);

  float atmosphereMix = smoothstep(-0.5, 1.0, orientation);
  vec3 atmosphereColor = mix(
    uAtmosphereTwilightColor,
    uAtmosphereDayColor,
    atmosphereMix
  );

  color = mix(
    color,
    atmosphereColor,
    fresnel * dayMix
  );

  vec3 reflection = reflect(-sunDirection, normal);

  float specular  = dot(reflection, -viewDirection);
        specular  = max(0.0, specular);
        specular  = pow(specular, 20.0);
        specular *= specularColor.r;

  vec3 specularMixColor = mix(
    vec3(1.0),
    uAtmosphereTwilightColor,
    fresnel
  );

  color += specularMixColor * specular;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
