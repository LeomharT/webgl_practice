varying vec3 vNormal;
varying vec3 vPosition;

void main(){
  vec3 color          = vec3(0.0);
  vec3 normal         = normalize(vNormal);
  vec3 lightDirection = normalize(vec3(3.0));
  vec3 viewDirection  = normalize(vPosition - cameraPosition);

  float orientation = dot(normal, lightDirection);
        orientation = smoothstep(-0.25, 1.0, orientation);

  vec3 reflection = reflect(-lightDirection, normal);

  float specular = dot(reflection, -viewDirection);
        specular = max(0.0, specular);
        specular = pow(specular, 20.0);


  color = vec3(specular);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}