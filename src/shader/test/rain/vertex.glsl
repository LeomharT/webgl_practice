varying vec2 vUv;
varying vec2 vNDC;

void main() {
    vec4 modelViewPosition     = modelViewMatrix * vec4(vec3(0.0), 1.0);
         modelViewPosition.xy += position.xy;

    vec4 projectionPosition = projectionMatrix * modelViewPosition;

    gl_Position = projectionPosition;

    vUv  = uv;
    vNDC = gl_Position.xy / gl_Position.w;
}