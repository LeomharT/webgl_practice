varying vec3 vColor;

void main() {
  vec3 color  = vColor;
  vec2 uv     = gl_PointCoord;
  vec2 center = vec2(0.5);

  float dist = distance(uv, center);

  float alpha = 0.05 / dist - 0.1;

  gl_FragColor = vec4(color, alpha);
}