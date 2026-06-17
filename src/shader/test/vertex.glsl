varying vec3 vNormal;

void main(){
  #include <begin_vertex>
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;
  #include <project_vertex>

  vNormal = modelNormal;
}