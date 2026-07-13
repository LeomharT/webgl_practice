varying vec2 vUv;
varying vec4 vTextureUv;

uniform sampler2D uReflectorTexture;

void main() {
    vec3 color     = vec3(0.0);
    vec2 uv        = vUv;
    vec2 textureUv = vTextureUv.xy / vTextureUv.w;

    vec4 reflectColor = texture2D(uReflectorTexture, textureUv);

    color = reflectColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}