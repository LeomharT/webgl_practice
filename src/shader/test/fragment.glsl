varying vec3 vNormal;

void main(){
  vec3  color          = vec3(0.0);
  vec3  normal         = normalize(vNormal);
  vec3  lightDirection = normalize(vec3(3.0));
  float orientation    = dot(normal, lightDirection);

  color = vec3(orientation);

  gl_FragColor = vec4(color, 1.0);
}