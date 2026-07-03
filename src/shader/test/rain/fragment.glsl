uniform sampler2D uFrameTexture;

varying vec2 vUv;
varying vec2 vNDC;

void main() {
    vec3 color = vec3(0.0);
    vec2 uv    = vUv;

    vec2 ndc = vNDC;
         ndc = ndc * 0.5 + 0.5;

    vec4 frame = texture2D(uFrameTexture, ndc += 0.01);

    color = frame.rgb;
    
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}