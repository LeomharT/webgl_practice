void main() {
    vec3 color = vec3(1.0);
    vec2 uv = gl_PointCoord;

    float dist = length(uv - 0.5);

    if(dist > 0.5) discard;

    gl_FragColor = vec4(color, 1.0);
}