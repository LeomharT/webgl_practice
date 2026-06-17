varying vec3 vNormal;
varying vec3 vPosition;

void main(){
  #include <begin_vertex>
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal   = transpose(inverse(mat3(modelMatrix))) * normal;
  #include <project_vertex>

  vNormal   = modelNormal;
  vPosition = modelPosition.xyz;
}