varying vec2 vUv;

uniform vec3 uColor;

void main() {
  vec3 color = uColor;
  vec2 uv = vUv;

  float h = smoothstep(0.2, 1.5, uv.y);
  color *= h;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
