varying vec2 vUv;

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;
  uv -= 0.5;

  float angle = atan(uv.x, uv.y);

  color = vec3(angle);

  gl_FragColor = vec4(color, 1.0);
}
