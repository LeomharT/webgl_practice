#define R 1.0

varying vec3 vPosition;

uniform vec3 uSpherePosition;

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

  float sdf = distance(p, uSpherePosition) - R;
  float mask = step(sdf, 0.0);

  float strength = smoothstep(-0.1, 0.0, sdf);
  strength *= mask;
  strength = pow(strength, 3.0);
  strength *= 3.0;

  color = vec3(strength);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
