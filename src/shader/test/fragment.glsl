varying vec2 vUv;
varying vec4 vTextureUv;

uniform sampler2D uReflectorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;
uniform sampler2D uOpacityTexture;

uniform float uDistortionAmount;
uniform float uBlurStrength;

uniform vec2 uResolution;

// https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl
vec4 sampleBicubic(float v) {
    vec4 n = vec4(1., 2., 3., 4.) - v;
    vec4 s = n * n * n;
    vec4 o;
    o.x = s.x;
    o.y = s.y - 4. * s.x;
    o.z = s.z - 4. * s.y + 6. * s.x;
    o.w = 6. - o.x - o.y - o.z;
    return o;
}

vec4 sampleBicubic(sampler2D tex, vec2 st, vec2 texResolution) {
    vec2 pixel = 1. / texResolution;
    st = st * texResolution - .5;

    vec2 fxy = fract(st);
    st -= fxy;

    vec4 xcubic = sampleBicubic(fxy.x);
    vec4 ycubic = sampleBicubic(fxy.y);

    vec4 c = st.xxyy + vec2(-.5, 1.5).xyxy;

    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4(xcubic.yw, ycubic.yw) / s;

    offset *= pixel.xxyy;

    vec4 sample0 = texture(tex, offset.xz);
    vec4 sample1 = texture(tex, offset.yz);
    vec4 sample2 = texture(tex, offset.xw);
    vec4 sample3 = texture(tex, offset.yw);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}

// With original size argument
vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, int level, vec2 originalPixelSize) {
    float floatLevel = float(level);
    vec2 atlasSize;
    atlasSize.x = floor(originalPixelSize.x * 1.5);
    atlasSize.y = originalPixelSize.y;
    // we stop making mip maps when one dimension == 1
    float maxLevel = min(floor(log2(originalPixelSize.x)), floor(log2(originalPixelSize.y)));
    floatLevel = min(floatLevel, maxLevel);
    // use inverse pow of 2 to simulate right bit shift operator
    vec2 currentPixelDimensions = floor(originalPixelSize / pow(2., floatLevel));
    vec2 pixelOffset = vec2(floatLevel > 0. ? originalPixelSize.x : 0., floatLevel > 0. ? currentPixelDimensions.y : 0.);
    // "minPixel / atlasSize" samples the top left piece of the first pixel
    // "maxPixel / atlasSize" samples the bottom right piece of the last pixel
    vec2 minPixel = pixelOffset;
    vec2 maxPixel = pixelOffset + currentPixelDimensions;
    vec2 samplePoint = mix(minPixel, maxPixel, uv);
    samplePoint /= atlasSize;
    vec2 halfPixelSize = 1. / (2. * atlasSize);
    samplePoint = min(samplePoint, maxPixel / atlasSize - halfPixelSize);
    samplePoint = max(samplePoint, minPixel / atlasSize + halfPixelSize);
    return sampleBicubic(tex, samplePoint, originalPixelSize);
}

vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, float level, vec2 originalPixelSize) {
    float ratio = mod(level, 1.);
    int minLevel = int(floor(level));
    int maxLevel = int(ceil(level));
    vec4 minValue = packedTexture2DLOD(tex, uv, minLevel, originalPixelSize);
    vec4 maxValue = packedTexture2DLOD(tex, uv, maxLevel, originalPixelSize);
    return mix(minValue, maxValue, ratio);
}

void main() {
    vec2 uv = vUv;
    vec3 color = vec3(0.0);

    vec4  normal    = texture2D(uNormalTexture, uv) * 2.0 - 1.0;
    float roughness = texture2D(uRoughnessTexture, uv).g;

    vec2  reflectUv = vTextureUv.xy / vTextureUv.w;
    vec2  finalUv   = reflectUv + normal.xy * uDistortionAmount;
    float level     = roughness * uBlurStrength;

    vec4 reflectColor = packedTexture2DLOD(uReflectorTexture, finalUv, level, uResolution);

    color = texture2D(uReflectorTexture, finalUv, level).rgb;
    // color = reflectColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}