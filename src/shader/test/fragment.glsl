varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 color = vec3(1.0);
  vec3 normal = normalize(vNormal);

  vec3 viewDirection = normalize(vPosition - cameraPosition);

  float fresnel = 1.0 + dot(normal, viewDirection);
  fresnel = max(fresnel, 0.0);
  fresnel = pow(fresnel, 2.0);

  color = vec3(fresnel);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
