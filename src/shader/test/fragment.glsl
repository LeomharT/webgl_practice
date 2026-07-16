varying vec3 vColor;

void main() {
    vec3 color = vec3(1.0);
    vec2 uv    = gl_PointCoord;

    float dist  = length(uv - 0.5);
    float alpha = 0.05 / dist - 0.1;

    color = vColor;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}   