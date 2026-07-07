uniform sampler2D uReflectorTexture;

varying vec2 vUv;
varying vec4 vTextureUv;


void main() {
    vec3 color     = vec3(0.0);
    vec2 uv        = vUv;
    vec4 textureUv = vTextureUv;

    vec4 reflectionColor = texture2D(uReflectorTexture, textureUv.xy / textureUv.w);

    color = reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}