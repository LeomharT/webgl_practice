varying vec3 vColor;

void main() {
  vec3 color = vColor;
  vec2 uv    = gl_PointCoord;

  gl_FragColor = vec4(color, 1.0);
}