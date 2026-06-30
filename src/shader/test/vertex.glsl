varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vReflection;

uniform mat4 uTextureMatrix;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  vec3 modelNormal = transpose(inverse(mat3(modelMatrix))) * normal;

  // Varying
  vUv = uv;
  vNormal = modelNormal;
  vReflection = uTextureMatrix * vec4(position, 1.0);

}
