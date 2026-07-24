varying vec2 vUv;
varying vec2 vNdc;

uniform sampler2D uFrameTexture;

void main() {
    vec2 uv    = vUv;
    vec3 color = vec3(0.128, 0.256, 0.778);
    vec2 ndc   = vNdc;

    float dist = length(uv - 0.5);

    if(dist > 0.5) discard;

    vec4 frameColor = texture2D(uFrameTexture, ndc);

    color += frameColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}