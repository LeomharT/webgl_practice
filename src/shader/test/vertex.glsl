attribute vec3 aPositionTarget;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

varying vec3 vColor;

#include <simplex3DNoise>

void main() {
    float noise = snoise(position);
    noise = (noise + 1.0) / 2.0;

    float duration = 0.5;
    float delay    = (1.0 - duration) * noise;
    float end      = duration + delay;
    float progress = smoothstep(delay, end, uProgress);

    vec3 p = mix(
        position,
        aPositionTarget,
        progress
    );

    vec4 modelPosition = modelMatrix * vec4(p, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize  = uSize * uResolution.y;
    gl_PointSize *= 1.0 / -viewPosition.z;

    vColor = vec3(1.0);
}