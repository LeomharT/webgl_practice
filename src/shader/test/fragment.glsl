varying vec2 vUv;

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = vUv;

  color = vec3(uv.x);

  gl_FragColor = vec4(color, 1.0);
}
