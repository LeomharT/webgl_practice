varying vec3 vColor;

void main() {
  vec3 color = vColor;
  vec2 uv = gl_PointCoord;

  float dist = length(uv - 0.5);
  if (dist > 0.5) discard;
  float alpha = 0.05 / dist - 0.1;

  gl_FragColor = vec4(color, 1.0);
}
