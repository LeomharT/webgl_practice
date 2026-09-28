precision mediump float;

varying vec4 vTexturePosition;
varying vec2 vUv;

uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;
uniform sampler2D uOpacityTexture;

uniform float uBlurStrength;
uniform float uNormalBias;
uniform vec2 uResolution;
uniform float uTime;

/*

A quick experiment with rain drop ripples.

This effect was written for and used in the launch scene of the
64kB PC intro "H - Immersion", by Ctrl-Alt-Test.

 > http://www.ctrl-alt-test.fr/productions/h-immersion/
 > https://www.youtube.com/watch?v=27PN1SsXbjM

-- 
Zavie / Ctrl-Alt-Test

*/

// Maximum number of cells a ripple can cross.
#define MAX_RADIUS 2

// Set to 1 to hash twice. Slower, but less patterns.
#define DOUBLE_HASH 0

// Hash functions shamefully stolen from:
// https://www.shadertoy.com/view/4djSRW
#define HASHSCALE1 0.1031
#define HASHSCALE3 vec3(0.1031, 0.103, 0.0973)

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy);

}

void main() {
  vec3 color = vec3(0.0);
  float resolution = 10.0 * exp2(-3.0 * 1.0 / uResolution.x);
  vec2 uv = vUv * resolution * 14.0;

  vec2 p0 = floor(uv);

  vec2 circles = vec2(0.0);
  for (int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j) {
    for (int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i) {
      vec2 pi = p0 + vec2(i, j);
      #if DOUBLE_HASH
      vec2 hsh = hash22(pi);
      #else
      vec2 hsh = pi;
      #endif
      vec2 p = pi + hash22(hsh);

      float t = fract(0.3 * uTime + hash12(hsh));
      vec2 v = p - uv;
      float d = length(v) - (float(MAX_RADIUS) + 1.0) * t;

      float h = 1e-3;
      float d1 = d - h;
      float d2 = d + h;
      float p1 =
        sin(31.0 * d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0.0, -0.3, d1);
      float p2 =
        sin(31.0 * d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0.0, -0.3, d2);
      circles +=
        0.5 * normalize(v) * ((p2 - p1) / (2.0 * h) * (1.0 - t) * (1.0 - t));
    }
  }
  circles /= float((MAX_RADIUS * 2 + 1) * (MAX_RADIUS * 2 + 1));

  float opacity = texture2D(uOpacityTexture, vUv).r;
  opacity = clamp(opacity, 0.0, 0.6);

  circles *= opacity;

  vec4 normalColor = texture2D(uNormalTexture, vUv);
  normalColor = normalColor * 2.0 - 1.0;
  vec3 normal = normalColor.rgb;

  float roughness = texture2D(uRoughnessTexture, vUv).g;

  vec3 rainUV = vec3(circles, sqrt(1.0 - dot(circles, circles)));
  vec2 textureUV = vTexturePosition.xy / vTexturePosition.w;
  vec2 finalUV = textureUV + normal.xy * uNormalBias - rainUV.xy;
  float level = roughness * uBlurStrength;

  vec4 reflectorColor = texture2D(uReflectorTexture, finalUV, level);

  color = reflectorColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
