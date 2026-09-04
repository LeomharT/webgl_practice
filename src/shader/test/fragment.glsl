uniform vec3 uColor;

varying vec2 vUv;

void main() {
  vec3 color = uColor;
  vec2 uv = vUv;

  float h = uv.y;
  h = smoothstep(0.25, 0.7, h);

  color = mix(color, vec3(1.0), h);
  color *= h;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
