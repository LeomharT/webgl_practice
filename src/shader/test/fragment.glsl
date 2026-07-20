varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uSunPosition;

void main() {
  vec3 color        = vec3(1.0);
  vec3 normal       = normalize(vNormal);
  vec3 sunDirection = normalize(uSunPosition);

  vec3 viewDirection = normalize(vPosition - cameraPosition);

  float fresnel = 1.0 + dot(normal, viewDirection);
  fresnel = max(fresnel, 0.0);
  fresnel = pow(fresnel, 2.0);

  vec3  reflection = reflect(-sunDirection, normal);

  float specular = -dot(reflection, viewDirection);
        specular = max(0.0, specular);
        specular = pow(specular, 20.0);

  color = vec3(specular);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
