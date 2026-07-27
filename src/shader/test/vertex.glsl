attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

#include <simplex3DNoise>

void main() {
    float noise = snoise(position);
    noise = (noise + 1.0) / 2.0;

    float duration = 0.4;
    float delay    = (1.0 - duration) * noise;
    float end      = duration + delay;
    float progress = smoothstep(delay, end, uProgress);

    vec3 p = mix(
        position,
        aPositionTarget,
        progress
    );

    vec4 modelPosition      = modelMatrix * vec4(p, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize  = uSize * uResolution.y * aSize;
    gl_PointSize *= 1.0 / -viewPosition.z;

    vColor = mix(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        noise
    );
}