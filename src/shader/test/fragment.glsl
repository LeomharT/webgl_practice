uniform sampler2D uReflectorTexture;

varying vec4 vTextureUv;
varying vec2 vUv;

void main() {
  vec3 color = vec3(0.0);
  vec2 uv    = vUv;

  vec4 reflectColor = texture2D(uReflectorTexture, vTextureUv.xy / vTextureUv.w);

  color = reflectColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}