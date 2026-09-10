#define PI 3.1415926

varying vec2 vUv;

uniform sampler2D uNoiseTexture;
uniform float uTime;

vec2 rotate(vec2 v, float theta) {
  float c = cos(theta);
  float s = sin(theta);

  mat2 m = transpose(mat2(c, -s, s, c));

  return m * v;
}

vec2 getWind(sampler2D noiseTexture, vec3 worldPosition) {
  float time = uTime;

  vec2 direction = vec2(-1.0, 1.0);
  direction = normalize(direction);

  vec2 noiseUv1 = worldPosition.xy * 0.06 + direction * time * 0.1;
  float noise1 = texture2D(noiseTexture, noiseUv1).r - 0.5;

  vec2 noiseUv2 = worldPosition.xy * 0.043 + direction * time * 0.03;
  float noise2 = texture2D(noiseTexture, noiseUv2).r;

  float intensity = noise1 * noise2;

  return direction * intensity;
}

void main() {
  vec4 instanceCenter = modelMatrix * instanceMatrix * vec4(vec3(0.0), 1.0);

  vec3 viewDirection = normalize(cameraPosition - instanceCenter.xyz);
  float angle = atan(viewDirection.z, viewDirection.x);

  vec3 p = position;
  p.xz = rotate(p.xz, angle + PI / 2.0);

  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec2 wind = getWind(uNoiseTexture, modelPosition.xyz);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
  gl_Position.x += wind.x * uv.y;

  // VARYING
  vUv = uv;
}
