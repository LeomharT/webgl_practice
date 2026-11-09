varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 p = vPosition;
  vec3 normal = normalize(vNormal);
  vec3 color = vec3(0.0);

  vec3 positionViewDirection = normalize(cameraPosition - p);

  float fresnel = 1.0 - dot(positionViewDirection, normal);
  fresnel = max(0.0, fresnel);
  fresnel = pow(fresnel, 6.0);

  color = vec3(fresnel);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
