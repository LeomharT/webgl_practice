attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

void main() {

    vec3 p = mix(
        position,
        aPositionTarget,
        uProgress
    );

    vec4 modelPosition      = modelMatrix * vec4(p, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize  = uSize * uResolution.y * aSize;
    gl_PointSize *= 1.0 / -viewPosition.z;

    vColor = vec3(1.0);
}