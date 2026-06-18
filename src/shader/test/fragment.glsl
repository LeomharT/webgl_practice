precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;

void main(){
  vec3 color          = vec3(0.0);
  vec3 normal         = normalize(vNormal);
  vec3 lightDirection = normalize(vec3(3.0));
  vec3 viewDirection  = normalize(vPosition - cameraPosition);

  float orientation = dot(normal, lightDirection);
        orientation = smoothstep(-0.25, 1.0, orientation);

  if(!gl_FrontFacing) discard;
  
  float fresnel = 1.0 + dot(viewDirection, normal);
        fresnel = pow(fresnel, 2.0);

  color = mix(
      vec3(1.0),
      vec3(1.0, 0.95, 0.32),
      fresnel
  );

  vec3 reflection = reflect(-lightDirection, normal);

  float specular = dot(reflection, -viewDirection);
        specular = max(0.0, specular);
        specular = pow(specular, 20.0);

  color *= specular;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}