#include <simplex4DNoise>

uniform vec3 uSunPosition;
uniform float uProgress;

varying vec3 vNormal;
varying vec3 vOriginNormal;
varying vec3 vPosition;

void main() {
  vec3 color = vec3(1.0);

  vec3 normal = normalize(vNormal);
  vec3 oNormal = normalize(vOriginNormal);
  vec3 sunPosition = normalize(uSunPosition);
  vec3 viewDirection = normalize(vPosition - cameraPosition);

  float noise = snoise(vec4(vPosition, 1.0) * 2.0);
  noise = noise * 0.5 + 0.5;

  if (bool(uProgress) && noise < uProgress) discard;

  float orientation = dot(normal, sunPosition);
  orientation = smoothstep(-0.25, 1.0, orientation);
  orientation = clamp(orientation, 0.0, 1.0);

  color = vec3(orientation);

  float fresnel = 1.0 + dot(oNormal, viewDirection);
  fresnel = pow(fresnel, 2.0);

  color *= fresnel;

  if (bool(uProgress) && noise < uProgress + 0.05) {
    color = vec3(1.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
