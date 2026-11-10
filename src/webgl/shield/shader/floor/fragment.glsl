#define R 2.0

varying vec3 vPosition;
varying vec2 vUv;

uniform mat4 uSpherePosition;

float remapClamp(
  float v,
  float inLow,
  float inHigh,
  float outLow,
  float outHigh
) {
  float t = clamp((v - inLow) / (inHigh - inLow), 0.0, 1.0);
  return mix(outLow, outHigh, t);
}

void main() {
  vec3 p = vPosition;
  vec3 color = vec3(0.0);
  vec2 uv = vUv;

  float sdf = distance(p, uSpherePosition[3].xyz) - R;
  float mask = step(sdf, 0.0);

  float strength = smoothstep(-0.1, 0.0, sdf);
  strength *= mask;
  strength = pow(strength, 3.0);
  strength *= 3.0;

  color = vec3(strength);

  #ifdef IS_FLOOR
  float dist = length(uv - vec2(0.5));
  if (dist > 0.5) discard;
  #endif

  csm_Emissive = color;

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
