varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;

  #include <begin_vertex>
  #include <project_vertex>

  vPosition = worldPosition.xyz;
  vNormal = modelNormal;
}
