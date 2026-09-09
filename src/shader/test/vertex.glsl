#define PI 3.1415926

varying vec2 vUv;

vec2 rotate(vec2 v, float theta) {
  float c = cos(theta);
  float s = sin(theta);

  mat2 m = transpose(mat2(c, -s, s, c));

  return m * v;
}

void main() {
  vec4 instanceCenter = modelMatrix * instanceMatrix * vec4(vec3(0.0), 1.0);

  vec3 viewDirection = normalize(cameraPosition - instanceCenter.xyz);
  float angle = atan(viewDirection.z, viewDirection.x);

  vec3 p = position;
  p.xz = rotate(p.xz, angle + PI / 2.0);

  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(p, 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // VARYING
  vUv = uv;
}
