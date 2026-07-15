varying vec2 vUv;
varying vec3 vColor;

uniform sampler2D uDayMap;

void main() {
    vec3 color  = vec3(1.0);
    vec2 uv     = gl_PointCoord;
    vec2 center = vec2(0.5);

    float dist  = length(uv - center);
    float alpha = 0.05 / dist - 0.1;

    color = vColor;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}