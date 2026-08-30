varying vec3 vNormal;

uniform vec3 uSunDirection;

void main() {
  vec3 color = vec3(1.0);
  vec3 normal = normalize(vNormal);

  vec3 sunDirection = normalize(uSunDirection);

  float orientation = dot(normal, sunDirection);

  color *= orientation;

  gl_FragColor = vec4(color, 1.0);
}
