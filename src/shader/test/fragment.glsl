uniform vec3 uSunPosition;

varying vec3 vNormal;

void main() {
  vec3 color = vec3(1.0);

  vec3 normal = normalize(vNormal);
  vec3 sunPosition = normalize(uSunPosition);

  float orientation = dot(normal, sunPosition);
  orientation = smoothstep(-0.25, 1.0, orientation);
  orientation = clamp(orientation, 0.0, 1.0);

  color = vec3(orientation);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
