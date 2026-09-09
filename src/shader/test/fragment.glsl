uniform vec3 uColor;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  vec3 color = uColor;

  color *= uv.y;

  gl_FragColor = vec4(color, 1.0);
}
