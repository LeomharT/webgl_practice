varying vec3 vColor;
varying float vHeight;


void main() {
  vec3 color = vColor;
  vec2 uv    = gl_PointCoord;

  float dist  = length(uv - 0.5);
  float alpha = 0.05 / dist - 0.1;

  color = mix(
    vec3(0.1, 0.25, 0.173),
    vec3(0.256, 0.07, 0.336),
    cos(vHeight)
  );

  gl_FragColor = vec4(color, alpha);
}