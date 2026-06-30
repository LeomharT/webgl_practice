varying vec2 vUv;
varying vec3 vNormal;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;

  // Varying
  vUv     = uv;
  vNormal = modelNormal;
}