varying vec3 vColor;
varying vec2 vUv;

uniform sampler2D uDayMapTexture;

void main() {
  vec3 color = vColor;
  vec2 uv = gl_PointCoord;

  vec2 uv2 = vUv;

  float dist = length(uv - 0.5);
  if (dist > 0.5) discard;

  vec4 dayColor = texture2D(uDayMapTexture, uv2);

  color = dayColor.rgb;

  gl_FragColor = vec4(color, 1.0);
}
