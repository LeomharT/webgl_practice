varying vec2 vUv;

uniform sampler2D uDayMap;

void main() {
    vec3 color  = vec3(1.0);
    vec2 uv     = gl_PointCoord;
    vec2 center = vec2(0.5);

    float dist  = length(uv - center);
    float alpha = 0.05 / dist - 0.1;

    vec4 mapColor = texture2D(uDayMap, vUv);

    color = vec3(alpha);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}