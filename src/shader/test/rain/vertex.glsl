void main() {
    vec3 p = vec3(0.0);

    vec4 modelViewPosition     = modelViewMatrix * vec4(p, 1.0);
         modelViewPosition.xy += position.xy;

    vec4 projectionPosition = projectionMatrix * modelViewPosition;

    gl_Position = projectionPosition;
}