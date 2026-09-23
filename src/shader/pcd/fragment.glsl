varying float vHeight;

vec3 getRainbowColor(float t) {
  t = clamp(t, 0.0, 1.0);

  vec3 c1 = vec3(1.0, 0.0, 0.0); // 红
  vec3 c2 = vec3(1.0, 0.5, 0.0); // 橙
  vec3 c3 = vec3(1.0, 1.0, 0.0); // 黄
  vec3 c4 = vec3(0.0, 1.0, 0.0); // 绿
  vec3 c5 = vec3(0.0, 1.0, 1.0); // 青
  vec3 c6 = vec3(0.0, 0.0, 1.0); // 蓝
  vec3 c7 = vec3(0.5, 0.0, 1.0); // 紫

  if (t < 1.0 / 6.0) {
    return mix(c1, c2, t * 6.0);
  } else if (t < 2.0 / 6.0) {
    return mix(c2, c3, (t - 1.0 / 6.0) * 6.0);
  } else if (t < 3.0 / 6.0) {
    return mix(c3, c4, (t - 2.0 / 6.0) * 6.0);
  } else if (t < 4.0 / 6.0) {
    return mix(c4, c5, (t - 3.0 / 6.0) * 6.0);
  } else if (t < 5.0 / 6.0) {
    return mix(c5, c6, (t - 4.0 / 6.0) * 6.0);
  } else {
    return mix(c6, c7, (t - 5.0 / 6.0) * 6.0);
  }
}

void main() {
  vec3 color = vec3(1.0);
  vec2 uv = gl_PointCoord;
  float height = vHeight;

  float dist = length(uv - 0.5);
  if (dist > 0.5) discard;

  color = getRainbowColor(smoothstep(0.3, 1.0, height));

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
