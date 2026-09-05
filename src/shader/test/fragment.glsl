uniform vec3 uSunPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 color = vec3(1.0);

  vec3 normal = normalize(vNormal);
  vec3 sunPosition = normalize(uSunPosition);
  vec3 viewDirection = normalize(vPosition - cameraPosition);

  float orientation = dot(normal, sunPosition);
  orientation = smoothstep(-0.25, 1.0, orientation);
  orientation = clamp(orientation, 0.0, 1.0);

  float fresnel = 1.0 + dot(vPosition, viewDirection);
  fresnel = pow(fresnel, 2.0);
  color *= fresnel;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
