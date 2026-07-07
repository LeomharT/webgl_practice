uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;

uniform float uNormalBais;
uniform float uBlurStrength;

uniform vec2 uResolution;

varying vec2 vUv;
varying vec4 vTextureUv;

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
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)

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
    float resolution = 10. * exp2(-3.0 * 0.0 / uResolution.x);

    vec3 color     = vec3(0.0);
    vec2 uv        = vUv / uResolution.y * resolution;
    vec4 textureUv = vTextureUv;

    vec2 p0 = floor(uv);

    vec4 normal = texture2D(uNormalTexture, vUv) * 2.0 - 1.0;
    float roughness = texture2D(uRoughnessTexture, vUv).g;

    vec2 reflectUv = textureUv.xy / textureUv.w;
    vec2 finalUv = reflectUv + normal.xy * uNormalBais;
    float level = roughness * uBlurStrength;

    vec4 reflectionColor = texture2D(uReflectorTexture, finalUv, level);

    color = reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}