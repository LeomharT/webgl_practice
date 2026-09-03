#define PI 3.1415926

varying vec2 vUv;

uniform float uTime;

vec2 rotateCenter(vec2 v, float theta) {
  float c = cos(theta);
  float s = sin(theta);

  mat2 m = transpose(mat2(c, -s, s, c));

  return m * v;
}

void main() {
  vec4 instancePosition = modelMatrix * instanceMatrix * vec4(vec3(0.0), 1.0);
  vec3 transformed = vec3(position);

  vec3 viewDirection = normalize(instancePosition.xyz - cameraPosition);
  float theta = atan(
    cameraPosition.z - instancePosition.z,
    cameraPosition.x - instancePosition.x
  );

  transformed.xz = rotateCenter(transformed.xz, theta + PI / 2.0);

  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // VARYING
  vUv = uv;
}
